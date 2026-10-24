**Idea:** store each vector with **fewer bits** (or a compact code) instead of 32-bit floats, and compare in that compressed form.

Assume 1M vectors, 1024 dims, float32 = $1024\times4=4096$ bytes each, about **4.1 GB**.

| Method | How | Bytes/vector | Reduction |
|---|---|---|---|
| **Scalar (int8)** | Map each float to an 8-bit integer with per-dimension (or global) min/max | 1024 | 4x |
| **Product quantization (PQ)** | Split into e.g. 128 sub-vectors, replace each with the index (1 byte) of the nearest centroid in a learned codebook | 128 | 32x |
| **Binary (1-bit)** | Keep only the sign of each dimension; compare with Hamming distance (fast popcount) | 128 | 32x |

**Trade-off:** less precision means distances are approximate, so **recall drops** (small for int8, noticeable for PQ/binary unless the model is trained for it).

**Limiting the loss**

1. **Oversample and re-score:** retrieve e.g. 5x to 10x candidates using compressed vectors, then **re-score the top ones with full-precision vectors** (kept on disk or in cheaper storage), and return top-k.
2. Use **models trained for quantisation robustness** (some embedding APIs offer int8/binary outputs).
3. Combine with **Matryoshka truncation** for further savings.
4. **Evaluate recall@k** against the float32 baseline on your own queries before switching.

```python
import numpy as np
x = np.random.randn(1000, 1024).astype("float32")
lo, hi = x.min(0), x.max(0)
q = np.round((x - lo) / (hi - lo) * 255).astype("uint8")    # int8-style scalar quant
b = (x > 0).astype("uint8"); packed = np.packbits(b, axis=1) # binary: 128 bytes each
print(q.nbytes / x.nbytes, packed.nbytes / x.nbytes)         # 0.25, 0.03125
```

**Rule of thumb:** int8 is a near-free 4x; PQ or binary for large scale with re-scoring.
