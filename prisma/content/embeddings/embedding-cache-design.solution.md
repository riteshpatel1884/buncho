**Purpose:** embedding the same text twice wastes money and latency. An **embedding cache** stores `text -> vector` so repeated texts (duplicate chunks, repeated queries, re-indexing unchanged documents) skip the model call.

**Where it helps**

- **Indexing:** re-ingesting a corpus where most chunks are unchanged; shared boilerplate; duplicated content across documents.
- **Querying:** popular or repeated search queries (a cache hit saves tens to hundreds of ms and API cost).
- **Evaluation and experiments:** re-running pipelines repeatedly.

**Design**

1. **Key = hash of (model name + version + dimension/params + normalised text)**, e.g. SHA-256. Including the model is essential: vectors from different models are not interchangeable.
2. **Normalise** text first (trim, collapse whitespace, optionally lowercase for queries) to raise hit rate, but only if the model would treat them equally.
3. **Store:** in-process LRU for hot queries; Redis/Memcached for shared low-latency access; a database or object store (SQLite, Parquet, vector DB) for the large persistent indexing cache.
4. **Value:** the vector (float16/float32 bytes), plus metadata (model, created time).
5. **Batch lookups:** check the cache for the whole batch, embed only the misses in one API call, write them back.

```python
import hashlib, numpy as np

def key(model, text):
    return hashlib.sha256(f"{model}\x00{' '.join(text.split())}".encode()).hexdigest()

def embed_with_cache(texts, model, embed_batch, cache):
    keys = [key(model, t) for t in texts]
    found = {k: cache.get(k) for k in set(keys)}
    misses = [t for t, k in zip(texts, keys) if found[k] is None]
    if misses:
        vecs = embed_batch(list(dict.fromkeys(misses)))            # dedupe misses
        for t, v in zip(dict.fromkeys(misses), vecs):
            k = key(model, t); cache.set(k, v); found[k] = v
    return np.stack([found[k] for k in keys])
```

**Invalidation:** entries are immutable for a given key, so **changing the model or its version changes the key** and old entries simply stop being used (evict later). TTL or size-based eviction controls storage.

**Pitfalls:** privacy (cached text hashes and vectors can leak information; scope per tenant and set retention), unbounded growth, stale entries after preprocessing changes (include a pipeline version in the key), and treating a semantic (similar-query) cache as the same thing: that is a different, riskier mechanism.
