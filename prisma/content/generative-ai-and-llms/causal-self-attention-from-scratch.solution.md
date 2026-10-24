$$\text{Attention}(Q,K,V)=\text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}+M\right)V,\qquad M_{ij}=\begin{cases}0 & j\le i\\ -\infty & j>i\end{cases}$$

```python
import numpy as np

def softmax(x, axis=-1):
    x = x - x.max(axis=axis, keepdims=True)           # numerical stability
    e = np.exp(x)
    return e / e.sum(axis=axis, keepdims=True)

def causal_attention(Q, K, V):
    # Q, K, V: (T, d)  (add a leading batch/head dim for the batched version)
    T, d = Q.shape
    scores = Q @ K.T / np.sqrt(d)                      # (T, T)
    mask = np.triu(np.ones((T, T), dtype=bool), k=1)   # True above the diagonal = future
    scores = np.where(mask, -np.inf, scores)
    weights = softmax(scores, axis=-1)                 # each row sums to 1
    return weights @ V, weights

# Test: changing a future token must not change earlier outputs
rng = np.random.default_rng(0)
Q, K, V = rng.normal(size=(3, 5, 8))
out1, w = causal_attention(Q, K, V)
K2, V2 = K.copy(), V.copy(); K2[4] += 10; V2[4] += 10      # alter the last token only
out2, _ = causal_attention(Q, K2, V2)
assert np.allclose(out1[:4], out2[:4])                      # positions 0..3 unchanged
assert np.allclose(np.triu(w, 1), 0)                        # no weight on the future
```

**Why each piece**

- $QK^\top$: similarity of every query with every key (relevance).
- $1/\sqrt{d_k}$: keeps score variance about 1; without it large $d_k$ pushes softmax into saturation with tiny gradients.
- **Causal mask:** needed for autoregressive training so position $i$ cannot see $i+1\ldots$, which would leak the answer. Setting scores to $-\infty$ gives exactly zero weight after softmax.
- Cost: $O(T^2 d)$ time and $O(T^2)$ memory for the score matrix, which is why long contexts need FlashAttention and similar methods.
