## Short answer

**Self-attention** lets every token in a sequence build a new representation of itself as a weighted mix of all tokens in the *same* sequence. The weights are computed from the content of the tokens, so the model decides dynamically which other tokens are relevant to each one.

## Computation

For input $$X \in \mathbb{R}^{T \times d}$$:

1. **Project:** $$Q = XW_Q,\ K = XW_K,\ V = XW_V$$.
2. **Score:** $$S = QK^\top$$, a $$T \times T$$ matrix of query–key dot products.
3. **Scale:** divide by $$\sqrt{d_k}$$ to keep the softmax well-behaved.
4. **Mask (decoders):** set future positions to $$-\infty$$.
5. **Normalise:** softmax along each row, so each row sums to 1.
6. **Mix:** multiply the weights by $$V$$.

$$\text{SelfAttn}(X)=\text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$$

```python
import numpy as np

def softmax(x, axis=-1):
    x = x - x.max(axis=axis, keepdims=True)
    e = np.exp(x)
    return e / e.sum(axis=axis, keepdims=True)

def self_attention(X, Wq, Wk, Wv):
    Q, K, V = X @ Wq, X @ Wk, X @ Wv
    scores = Q @ K.T / np.sqrt(K.shape[-1])
    return softmax(scores) @ V
```

## Properties

- **Content-based routing:** which tokens interact depends on the data, not on fixed positions.
- **Direct long-range links:** any two tokens interact in one layer, which helps with dependencies such as coreference.
- **Parallel:** all positions are computed at once, which suits GPUs.
- **Permutation-equivariant:** order is invisible without positional information.

## Main limitation

The score matrix is $$T \times T$$, so compute and (in the naive implementation) memory grow **quadratically** with sequence length. FlashAttention removes the quadratic memory by never materialising the full matrix, but the compute is still quadratic.

## Interview follow-up

*"How is it different from attention in RNN encoder–decoder models?"* Earlier attention let a decoder look at encoder states. Self-attention applies the same mechanism within one sequence and replaces the recurrence entirely.
