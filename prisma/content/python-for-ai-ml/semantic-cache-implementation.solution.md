```python
import time
import numpy as np

class SemanticCache:
    def __init__(self, embed, threshold=0.92, ttl=3600, max_items=10_000):
        self.embed, self.th, self.ttl, self.max = embed, threshold, ttl, max_items
        self.vecs = np.empty((0, 0), dtype=np.float32)
        self.items = []                                     # (answer, timestamp, scope)

    def _vec(self, text):
        v = np.asarray(self.embed(text), dtype=np.float32)
        return v / np.linalg.norm(v)

    def get(self, query, scope="global"):
        if not self.items:
            return None
        sims = self.vecs @ self._vec(query)                 # cosine: vectors are unit length
        for i in np.argsort(-sims)[:3]:
            answer, ts, sc = self.items[i]
            if sims[i] < self.th:
                break
            if sc == scope and time.time() - ts < self.ttl:
                return answer
        return None

    def put(self, query, answer, scope="global"):
        v = self._vec(query)[None, :]
        self.vecs = v if self.vecs.size == 0 else np.vstack([self.vecs, v])
        self.items.append((answer, time.time(), scope))
        if len(self.items) > self.max:                      # simple FIFO eviction
            self.vecs, self.items = self.vecs[1:], self.items[1:]

def cached_llm(cache, llm, query, scope="global"):
    hit = cache.get(query, scope)
    if hit is not None:
        return hit, "hit"
    answer = llm(query)
    cache.put(query, answer, scope)
    return answer, "miss"
```

**Pitfalls and how to handle them**

- **False hits are the main risk.** "How do I cancel my order?" vs "How do I cancel my subscription?" are close in embedding space but need different answers. Tune the threshold on labelled pairs (same-intent vs different-intent) and optimise **precision** first; typical thresholds are high (0.9+), but measure with your model.
- **Scope the cache** by tenant/user, language, product version and prompt version so answers are not leaked or stale.
- **Do not cache** personalised, time-sensitive or tool-dependent answers.
- Optional **verification step**: a cheap reranker/LLM check that the cached question really matches.
- **TTL and invalidation** when source documents change.
- Replace the NumPy scan with a vector index (and Redis/vector DB) at scale.
- Report hit rate, latency saved and measured wrong-hit rate through sampling.
