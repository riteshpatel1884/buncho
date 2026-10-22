**Model.** `async def` creates a **coroutine**. An **event loop** runs many coroutines on a single thread. When a coroutine hits `await` on something that must wait (network response, sleep), it yields control and the loop runs another task. The wake-up happens when the I/O is ready. This is **concurrency, not parallelism**.

**Why it suits LLM calls.** A request spends most of its time waiting for the remote server (hundreds of ms to many seconds). Sequential code idles during every wait; asyncio overlaps hundreds of waits on one thread with tiny per-task overhead.

```python
import asyncio

async def main(prompts):
    sem = asyncio.Semaphore(20)                 # respect rate limits
    async def one(p):
        async with sem:
            return await client.generate(p)     # async client
    return await asyncio.gather(*(one(p) for p in prompts), return_exceptions=True)
```

Streaming responses map naturally to async generators (`async for chunk in stream`), which is how chat backends push tokens to users.

**Common mistakes**
1. **Blocking calls inside `async def`** (`requests.get`, `time.sleep`, heavy CPU work, synchronous DB drivers) freeze the whole loop. Use async libraries, or `await asyncio.to_thread(fn)` / a process pool.
2. **Forgetting `await`**, which gives you a coroutine object that never ran.
3. **Unbounded concurrency**, causing 429 errors or memory blowup. Use a semaphore or worker queue.
4. **Swallowed task errors:** with `gather` use `return_exceptions=True` or `asyncio.TaskGroup` (3.11+), and always handle timeouts (`asyncio.timeout`).
5. Calling `asyncio.run` inside an already running loop (Jupyter, FastAPI handlers). In notebooks use `await` directly.
