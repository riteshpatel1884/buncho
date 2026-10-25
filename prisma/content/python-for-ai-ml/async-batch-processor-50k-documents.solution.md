**Design**

- **Worker pool + bounded queue** instead of `gather` over 50,000 coroutines: memory stays flat and the producer is back-pressured by the queue.
- **Full-jitter backoff:** `sleep(uniform(0, min(cap, base * 2**attempt)))` spreads retries so workers do not hammer the API in lockstep after a 429.
- **Retry only transient errors** (rate limit, 5xx, timeout). Bad requests and content-policy errors are permanent, so record them and move on.
- **Error isolation:** each worker catches everything per document and writes a failure record.
- **Durable progress:** append one JSON line per finished document and flush; on restart read the file and skip finished ids (idempotent resume).

```python
import asyncio, json, os, random

class Retryable(Exception): ...          # 429 / 5xx / timeout
class Fatal(Exception): ...              # 400 / content policy: do not retry

async def with_retry(fn, *, attempts=5, base=0.5, cap=30.0, timeout=60.0):
    for n in range(attempts):
        try:
            return await asyncio.wait_for(fn(), timeout)
        except (Retryable, asyncio.TimeoutError):
            if n == attempts - 1: raise
            await asyncio.sleep(random.uniform(0, min(cap, base * 2 ** n)))   # full jitter

async def process_all(docs, call_llm, *, concurrency=50, out_path="results.jsonl", **retry_kw):
    done = set()
    if os.path.exists(out_path):                                # resume after a crash
        with open(out_path) as f: done = {json.loads(l)["id"] for l in f}
    todo = [(i, d) for i, d in docs if i not in done]
    q: asyncio.Queue = asyncio.Queue(maxsize=concurrency * 2)   # bounded: never 50k tasks in memory
    lock, stats = asyncio.Lock(), {"ok": 0, "failed": 0}

    async def worker(out):
        while (item := await q.get()) is not None:
            i, d = item
            try:
                rec = {"id": i, "ok": True, "result": await with_retry(lambda: call_llm(d), **retry_kw)}
                stats["ok"] += 1
            except Exception as e:                              # error isolation: record, continue
                rec = {"id": i, "ok": False, "error": f"{type(e).__name__}: {e}"}
                stats["failed"] += 1
            async with lock:
                out.write(json.dumps(rec) + "\n"); out.flush()  # durable progress
            q.task_done()
        q.task_done()

    with open(out_path, "a") as out:
        workers = [asyncio.create_task(worker(out)) for _ in range(concurrency)]
        for item in todo: await q.put(item)
        for _ in workers: await q.put(None)                     # one stop signal per worker
        await asyncio.gather(*workers)
    return stats
```

I ran this against a fake LLM that fails 20% of calls transiently and always rejects documents ending in 7: 2,000 documents finished with `{'ok': 1797, 'failed': 203}`, and a second run reported `{'ok': 0, 'failed': 0}` because everything was already in the results file (resume works). The 203 failures are the 200 permanent errors plus a few documents that exhausted their retries.

**Production details**

- **Rate limits, not only concurrency:** 50 concurrent calls can still exceed tokens-per-minute. Put a token-bucket limiter in front of `call_llm` and honour `Retry-After` headers.
- **Retry failed ids later:** the failure records form a dead-letter list; rerun only those after fixing the cause (change `ok` handling to skip only `ok: true` records on resume).
- **Cancellation:** on SIGINT cancel workers and let the file hold what finished; use `asyncio.TaskGroup` (3.11+) for structured cleanup.
- **Large outputs:** write to a database or object storage in batches instead of one file if results are big; add `asyncio.to_thread` for blocking I/O.
- **Observability:** log throughput, retry counts, error classes and p95 latency; a progress bar from `stats`.
- **Cost control:** truncate inputs, dedupe identical documents, and consider the provider's **batch API** (about 50% cheaper) when results are not needed immediately.
