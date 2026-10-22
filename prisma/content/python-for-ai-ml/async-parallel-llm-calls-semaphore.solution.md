```python
import asyncio

async def run_all(prompts, call_llm, limit=10, timeout=60):
    sem = asyncio.Semaphore(limit)

    async def one(prompt):
        async with sem:                                   # at most `limit` in flight
            return await asyncio.wait_for(call_llm(prompt), timeout)

    results = await asyncio.gather(*(one(p) for p in prompts), return_exceptions=True)
    ok     = [(i, r) for i, r in enumerate(results) if not isinstance(r, Exception)]
    failed = [(i, r) for i, r in enumerate(results) if isinstance(r, Exception)]
    return results, failed
```

**Why this satisfies the requirements**
- `gather` returns results in **input order**, regardless of completion order.
- `return_exceptions=True` puts exceptions into the result list instead of raising the first one and abandoning the rest.
- The semaphore bounds concurrency, and `wait_for` bounds each call's duration. Note that the timeout covers only the call, not time spent waiting for the semaphore, because `wait_for` is inside the `async with`.

**Improvements to mention**
- Creating 1,000,000 tasks at once wastes memory. Use a **bounded queue with N worker tasks**, or process in chunks.
- Combine with retries/backoff for 429s, and a **rate limiter** (requests and tokens per minute), not only a concurrency cap.
- Python 3.11+: `asyncio.TaskGroup` gives structured concurrency, but it cancels all tasks on the first error, so wrap each task body in try/except if you want partial results.
- Persist results incrementally so a crash at prompt 900 does not lose everything.
