```python
import numpy as np

def normalize(a, axis=-1, eps=1e-12):
    return a / np.maximum(np.linalg.norm(a, axis=axis, keepdims=True), eps)

def top_k_cosine(query, docs_normed, k=5):
    q = normalize(query)
    scores = docs_normed @ q                       # (N,) cosine scores in one BLAS call
    k = min(k, scores.shape[0])
    idx = np.argpartition(-scores, k - 1)[:k]      # O(N): the k best, unordered
    idx = idx[np.argsort(-scores[idx])]            # sort only those k
    return idx, scores[idx]

docs_normed = normalize(docs.astype(np.float32))   # do this ONCE at index time
```

**Key ideas**
- `cos(a, b) = a·b / (|a||b|)`. If rows are pre-normalised to unit length, cosine similarity is just a **dot product**, so scoring all documents is one matrix-vector multiply. Normalise the corpus once, not per query.
- `np.argpartition` finds the top-k in **O(N)**; sorting all N costs O(N log N). Then sort only the k winners.
- Use `float32` to halve memory and speed up the multiply. One million 768-dim vectors is about 3 GB in float32.
- Guard zero vectors with an `eps`.
- For many queries at once, `Q_normed @ docs_normed.T` gives `(Q, N)`. Do it in chunks to cap memory.

**Beyond brute force.** Around tens of millions of vectors or strict latency, use an ANN index (FAISS IVF/HNSW, ScaNN, a vector database) which trades a little recall for large speedups, and measure recall@k against the exact result.
