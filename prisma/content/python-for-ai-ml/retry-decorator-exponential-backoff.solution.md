```python
import functools, random, time

def retry(max_attempts=5, base_delay=1.0, max_delay=30.0, exceptions=(Exception,)):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return fn(*args, **kwargs)
                except exceptions:
                    if attempt == max_attempts:
                        raise                                   # keep the original traceback
                    delay = min(max_delay, base_delay * 2 ** (attempt - 1))
                    time.sleep(random.uniform(0, delay))        # "full jitter"
        return wrapper
    return decorator

@retry(max_attempts=4, exceptions=(TimeoutError, ConnectionError))
def call_llm(prompt): ...
```

**Design points**
- **Exponential backoff** (1s, 2s, 4s...) gives a struggling server time to recover; **jitter** stops many clients retrying in lockstep (thundering herd).
- Retry **transient** failures only: timeouts, connection errors, 429, 500/502/503. Do **not** retry 400 (bad request), 401/403 (auth) or validation errors; they will never succeed.
- Respect the server's `Retry-After` header when present.
- Only retry **idempotent** operations, or use idempotency keys. Retrying a "send email" or "charge card" tool call can duplicate side effects.
- Put a **total deadline** on the whole operation, not just per attempt, and log each retry.
- Async version: same logic with `await asyncio.sleep(...)` and `async def wrapper`. Libraries such as `tenacity` provide this ready-made.
