**Definitions** (for vectors $a, b$)

- **Dot product:** $a\cdot b$. Depends on direction **and magnitude**.
- **Cosine similarity:** $\dfrac{a\cdot b}{\|a\|\|b\|}$. Direction only, range $[-1, 1]$.
- **Euclidean (L2) distance:** $\|a-b\|$. Smaller is closer.

**Relationship:** for **unit-length** vectors, $\|a-b\|^2 = 2 - 2\,(a\cdot b)$. So cosine, dot product and L2 produce **the same ranking**. Normalising once at ingest lets you use the fastest one (dot product).

```python
import numpy as np
a, b = np.random.randn(2, 768)
a, b = a/np.linalg.norm(a), b/np.linalg.norm(b)
cos = a @ b
l2sq = np.sum((a-b)**2)
assert np.isclose(l2sq, 2 - 2*cos)
```

**Choosing**

1. **Use the metric the embedding model was trained with** (check its docs); this is the main rule.
2. Most text embedding models: **cosine** (or dot product on normalised vectors).
3. **Dot product without normalisation** is used when magnitude carries meaning, e.g. some recommendation models or learned sparse/dense retrievers.
4. **L2** suits some image or geometric embeddings.

**Pitfalls**

- The index metric must match what you pass at query time; a mismatch silently degrades results.
- Cosine on un-normalised vectors in an index that only supports dot product gives wrong rankings.
- High similarity does not mean relevance; scores are **not comparable across models** or queries, so avoid fixed global thresholds without calibration.
