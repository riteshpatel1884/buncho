**Dimensionality** is the length of the vector (384, 768, 1024, 1536, 3072...). It is set by the model.

**Effects**

| | Higher dimensions | Lower dimensions |
|---|---|---|
| Quality | Usually a bit better (more capacity) | Slight drop; saturates quickly |
| Storage | Larger | Smaller |
| Search speed | Slower (more arithmetic, bigger index) | Faster |
| Cost | More RAM/disk, more network | Less |

**Memory example:** 1M vectors at 1024 dims in float32 is $10^6\times1024\times4\approx4.1$ GB; at 256 dims it is about 1 GB. Index structures (e.g. HNSW graph) add more on top.

**Quality gains flatten out:** going from 384 to 1536 dims often gives only a few points of retrieval metric, while quadrupling cost. Always check on your own data.

**Ways to reduce dimension**

1. **Matryoshka (MRL) models:** trained so the **first k dimensions** are a good embedding on their own. Truncate (e.g. 3072 to 512) and re-normalise. Some APIs expose a `dimensions` parameter.
2. **PCA / random projection:** works on any model but needs fitting and loses some quality.
3. **Quantisation** (int8, binary): shrinks bytes per dimension instead.

```python
v = full_vec[:512]
v = v / np.linalg.norm(v)      # re-normalise after truncation
```

**Process:** evaluate recall@k / nDCG at several dimensions on a gold set, then choose the smallest size within your quality tolerance. Changing dimension later means re-indexing.
