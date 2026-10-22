**Cause.** `requests.post` is a **blocking** call. It holds the only event-loop thread for the whole HTTP round trip, and `async def` does not change that. Only `await` hands control back to the loop. `gather` schedules 50 coroutines, but each one blocks until finished, so they run effectively one after another: 50 x 2 s.

**Fix A (best): use a real async client**

```python
import httpx

async def summarize(client, text, sem):
    async with sem:
        r = await client.post(URL, json={"text": text}, timeout=30)
        r.raise_for_status()
        return r.json()["summary"]

async def main(texts):
    sem = asyncio.Semaphore(20)
    async with httpx.AsyncClient() as client:
        return await asyncio.gather(*(summarize(client, t, sem) for t in texts))
```

Now the waits overlap: about 2-3 seconds total for 50 calls (subject to rate limits).

**Fix B: keep the blocking library but move it off the loop**

```python
async def summarize(text):
    resp = await asyncio.to_thread(requests.post, URL, json={"text": text}, timeout=30)
    return resp.json()["summary"]
```

Works with legacy sync SDKs. Threads are limited by the default executor size (and need a semaphore for rate limits).

**Why A is better:** lower overhead per request, scales to thousands of concurrent calls, supports cancellation and timeouts cleanly, and reuses connections. Use B as a bridge for sync-only code, and a process pool for CPU-heavy work.

**Detection tip:** run with `asyncio.run(main(), debug=True)` to log slow callbacks, and time a single call vs the batch. If total time equals the sum of individual times, something is blocking.
