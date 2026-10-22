```python
import threading
import time

class TokenBucket:
    def __init__(self, rate_per_sec, capacity):
        self.rate = rate_per_sec
        self.capacity = capacity
        self.tokens = float(capacity)
        self.updated = time.monotonic()           # monotonic: immune to wall-clock changes
        self.lock = threading.Lock()

    def _refill(self):
        now = time.monotonic()
        self.tokens = min(self.capacity, self.tokens + (now - self.updated) * self.rate)
        self.updated = now

    def acquire(self, n=1):
        if n > self.capacity:
            raise ValueError("request larger than bucket capacity")
        while True:
            with self.lock:
                self._refill()
                if self.tokens >= n:
                    self.tokens -= n
                    return
                wait = (n - self.tokens) / self.rate
            time.sleep(wait)                      # sleep OUTSIDE the lock

requests_bucket = TokenBucket(rate_per_sec=60 / 60, capacity=60)
tokens_bucket   = TokenBucket(rate_per_sec=90_000 / 60, capacity=90_000)

def call(prompt, est_tokens):
    requests_bucket.acquire(1)
    tokens_bucket.acquire(est_tokens)
    return client.generate(prompt)
```

**How it works.** Tokens accumulate continuously at `rate` up to `capacity` (allowing short bursts). A request spends `n` tokens or waits exactly long enough for them to accrue.

**Points to discuss**
- Never sleep while holding the lock, or every other thread stalls.
- Use **two buckets**: one for request count, one for tokens (estimate input tokens plus `max_tokens`, then reconcile with actual usage if the provider reports it).
- **Async version:** replace `threading.Lock` with `asyncio.Lock` (or avoid it, since the event loop is single-threaded) and `time.sleep` with `await asyncio.sleep`.
- **Multiple processes or machines:** local buckets divide the quota poorly. Use a shared store (Redis with an atomic Lua script or `INCR` with expiry) or a central gateway, and still handle 429s with backoff because your estimate can be wrong.
- Complementary tools: a semaphore bounds *concurrency*; a token bucket bounds *rate*. You usually need both.
