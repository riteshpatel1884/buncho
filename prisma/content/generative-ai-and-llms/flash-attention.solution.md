**Bottleneck:** standard attention materialises the `N x N` score matrix `S = QK^T` in GPU high-bandwidth memory (HBM), reads it for softmax, writes the probabilities, then reads again for `P V`. For long sequences this is dominated by slow HBM reads and writes and needs `O(N^2)` memory.

**Flash Attention (Dao et al.)** is *IO-aware* and **exact** (not an approximation):

1. **Tiling:** split `Q, K, V` into blocks that fit in fast on-chip SRAM.
2. **Fusion:** for each query block, loop over key/value blocks and do score, softmax and weighted sum in one kernel, never writing the full `N x N` matrix to HBM.
3. **Online softmax:** keep a running max `m` and running sum `l` per row so softmax is computed incrementally:

```python
# per query row, over blocks j
m_new = max(m, s_j.max())
l = l * exp(m - m_new) + exp(s_j - m_new).sum()
acc = acc * exp(m - m_new) + exp(s_j - m_new) @ v_j
m = m_new
out = acc / l
```

4. **Backward pass:** recompute scores from `Q, K, V` instead of storing them (cheap compute for saved memory).

**Results:** memory drops from `O(N^2)` to `O(N)`, and runtime improves a lot (typically 2 to 4x) because HBM traffic falls. FLOPs are still `O(N^2)`.

**What it does not do:** it does not make attention sub-quadratic in compute; combine it with sliding windows or sparse attention for that. It also speeds up training and prefill more than single-token decoding.
