**1. In-process memoisation**

```python
from functools import lru_cache

@lru_cache(maxsize=50_000)
def embed(text: str) -> tuple[float, ...]:
    return tuple(client.embed([text])[0])     # return an immutable value

embed("red shoes"); embed("red shoes")        # second call is a cache hit
embed.cache_info()                            # hits, misses, size
```

Limits:
- Arguments must be **hashable** (no lists or dicts).
- Cached values are **shared**: if you return a NumPy array, one caller can mutate it for everyone. Return a tuple or set `arr.flags.writeable = False`.
- The cache lives in **one process** and disappears on restart. `maxsize=None` leaks memory.
- Not suited to batch APIs because it wraps one call at a time. Also cache keys must include the **model name and version**, otherwise changing models silently serves stale vectors.

**2. Persistent, batch-aware (cache-aside)**

```python
import hashlib

def key(text, model="embed-v1"):
    return hashlib.sha256(f"{model}\0{text.strip()}".encode()).hexdigest()

def embed_many(texts, cache, client):
    keys = [key(t) for t in texts]
    missing = {k: t for k, t in zip(keys, texts) if k not in cache}   # also de-duplicates
    if missing:
        vectors = client.embed(list(missing.values()))                # one batched call
        for k, v in zip(missing.keys(), vectors):
            cache[k] = v                                              # dict, sqlite, diskcache, Redis
    return [cache[k] for k in keys]
```

Normalise text consistently before hashing (strip, Unicode normalisation) so trivially different strings hit the same entry, and add an expiry or version for invalidation.
