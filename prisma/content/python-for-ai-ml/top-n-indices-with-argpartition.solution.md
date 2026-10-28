```python
import numpy as np

scores = np.array([0.1, 0.9, 0.3, 0.7, 0.5, 0.8])
k = 3

# 1) Simple: sort everything, O(n log n).
top_sort = np.argsort(scores)[-k:][::-1]
assert top_sort.tolist() == [1, 5, 3]

# 2) Faster: partition so the k largest are in the last k slots, O(n).
part = np.argpartition(scores, -k)[-k:]          # the right indices, but in no particular order
top_fast = part[np.argsort(-scores[part])]       # sort only those k
assert top_fast.tolist() == [1, 5, 3]

# 3) Per row of a matrix (for example the top-k similar documents for each query).
sim = np.array([[0.2, 0.9, 0.4],
                [0.8, 0.1, 0.5]])
k = 2
idx = np.argpartition(sim, -k, axis=1)[:, -k:]
row_order = np.argsort(-np.take_along_axis(sim, idx, axis=1), axis=1)
ordered = np.take_along_axis(idx, row_order, axis=1)
assert ordered.tolist() == [[1, 2], [0, 2]]

assert np.take_along_axis(sim, ordered, axis=1).tolist() == [[0.9, 0.4], [0.8, 0.5]]
```

**Key points**

- `np.argsort` gives a full ordering in O(n log n). `np.argpartition(a, -k)` places the k largest values in the last k positions in **O(n)**, but their order is arbitrary, so sort just those k afterwards.
- To get the **smallest** k, use `np.argpartition(a, k)[:k]`.
- For a single array, `np.argmax` gives the top-1 and `heapq.nlargest(k, ...)` works on plain Python lists.
- Ties are broken arbitrarily. Use `kind="stable"` in `argsort` if you need deterministic ties.
- In ML this is the core of retrieval (top-k nearest neighbours), beam search and top-k sampling. For millions of vectors, move to an ANN index (FAISS, HNSW).
