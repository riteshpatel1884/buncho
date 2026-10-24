```python
import numpy as np

def dot(a, b):        return a @ b.T
def cosine(a, b):
    a = a / np.linalg.norm(a, axis=-1, keepdims=True)
    b = b / np.linalg.norm(b, axis=-1, keepdims=True)
    return a @ b.T
def neg_euclid(a, b):  # negated so that "bigger = more similar" for all metrics
    return -np.sqrt(((a[:, None, :] - b[None, :, :]) ** 2).sum(-1))

METRICS = {"dot": dot, "cosine": cosine, "euclidean": neg_euclid}

class VectorStore:
    def __init__(self):
        self.vecs, self.payloads = np.empty((0, 0)), []

    def add(self, vectors, payloads):
        v = np.asarray(vectors, dtype=np.float32)
        self.vecs = v if self.vecs.size == 0 else np.vstack([self.vecs, v])
        self.payloads += list(payloads)

    def search(self, query, k=3, metric="cosine"):
        q = np.asarray(query, dtype=np.float32)[None, :]
        scores = METRICS[metric](q, self.vecs)[0]
        k = min(k, len(scores))
        idx = np.argpartition(-scores, k - 1)[:k]        # O(N) top-k
        idx = idx[np.argsort(-scores[idx])]              # sort only k items
        return [(self.payloads[i], float(scores[i])) for i in idx]

# Semantic search = embed documents, embed query, take nearest vectors
# store.add(model.encode(docs), docs); store.search(model.encode(q), k=3)
```

**Test:** build a few 2D vectors, confirm cosine ignores length (`[1,0]` vs `[5,0]` score 1.0) while Euclidean does not, and that unit-length vectors give identical rankings for all three metrics.

**Where it stops scaling:** every query scans all N vectors ($O(Nd)$) and stores raw float32. Past hundreds of thousands of vectors move to an ANN index (HNSW/IVF), quantisation, and a vector database. This brute-force version is still the **ground truth** for measuring ANN recall.
