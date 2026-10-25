**Single process:** the bucket holds `tokens` and a timestamp. On each request: refill `elapsed * rate` (capped at `capacity`), then spend `cost` if enough tokens remain; otherwise report how long to wait: `(cost - tokens) / rate`. A request larger than `capacity` can never succeed, so reject it immediately.

**Distributed:** read-modify-write from several servers is a race (two servers read 600 tokens and both spend 500). The fix is to run refill + check + spend as **one atomic Redis Lua script**. Use the **Redis server clock** (`TIME`) so app servers with skewed clocks cannot disagree.

```python
import time, redis

LUA = """
local key, cap, rate, cost, now = KEYS[1], tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3]), tonumber(ARGV[4])
local s = redis.call('HMGET', key, 'tokens', 'ts')
local tokens, ts = tonumber(s[1]), tonumber(s[2])
if tokens == nil then tokens, ts = cap, now end
tokens = math.min(cap, tokens + (now - ts) * rate)
local allowed, wait = 0, 0
if tokens >= cost then tokens = tokens - cost; allowed = 1
else wait = (cost - tokens) / rate end
redis.call('HSET', key, 'tokens', tokens, 'ts', now)
redis.call('EXPIRE', key, math.ceil(cap / rate) * 2)
return {allowed, tostring(wait)}
"""

class DistributedTokenBucket:
    def __init__(self, r: redis.Redis, key: str, capacity: float, refill_per_sec: float):
        self.r, self.key, self.cap, self.rate = r, key, capacity, refill_per_sec
        self.script = r.register_script(LUA)

    def try_acquire(self, cost: float):
        now = self.r.time(); now = now[0] + now[1] / 1e6          # Redis clock: no skew between app servers
        allowed, wait = self.script(keys=[self.key], args=[self.cap, self.rate, cost, now])
        return bool(allowed), float(wait)

    def acquire(self, cost: float, max_wait=30.0):
        if cost > self.cap: raise ValueError("request larger than bucket capacity")
        deadline = time.time() + max_wait
        while True:
            ok, wait = self.try_acquire(cost)
            if ok: return
            if time.time() + wait > deadline: raise TimeoutError("rate limited")
            time.sleep(wait)

    def refund(self, amount: float):                              # estimated minus actual tokens
        self.r.hincrbyfloat(self.key, "tokens", amount)
```

I ran this against `fakeredis` with Lua support, using capacity 1,000 and refill 500 tokens/s:

```text
try_acquire(600) -> (True, 0.0)
try_acquire(600) -> (False, 0.399)     # only 400 left, must wait about 0.4 s
sleep 0.5 s
try_acquire(600) -> (True, 0.0)        # refilled
```

(It was not run against a real Redis server.)

**Usage:** `bucket.acquire(len(prompt_tokens) + max_tokens)` before each call. After the response, call `refund(estimated - usage.total_tokens)` so unused output budget returns to the pool (clamp at capacity in the script if you want a strict cap).

**Production details**

- **Several limits at once:** providers enforce requests-per-minute and tokens-per-minute (and sometimes per-model); use one bucket per limit and acquire from all, refunding the others if one rejects.
- **Redis down:** decide fail-open (risk 429s, rely on backoff) or fail-closed (outage); a local fallback bucket with `quota / n_servers` is a reasonable middle.
- **Redis Cluster:** keep each bucket on one key (and one slot); use `{org1}` hash tags when a script touches several keys.
- **Fairness:** queue waiters and serve by priority instead of every server sleeping and polling; add jitter to the sleep to avoid thundering herds.
- **Still handle 429s:** your estimate and the provider's accounting can differ, so keep exponential backoff with jitter and honour `Retry-After`.
- **Alternatives:** sliding-window counters, GCRA, a central gateway or LiteLLM/Envoy rate-limit service, or provider-side per-key limits.
