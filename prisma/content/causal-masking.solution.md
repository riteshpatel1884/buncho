## Short answer

**Causal masking** prevents a token from attending to tokens that come after it. Before the softmax, scores for future positions are set to $$-\infty$$, so their attention weights become exactly 0.

## Why it is needed

A decoder-only model is trained to predict token $$t+1$$ from tokens $$1..t$$. Training is done on all positions in parallel (teacher forcing), so without a mask, position $$t$$ could read token $$t+1$$ and simply copy it. The loss would collapse toward zero, and the model would be useless at generation time, when future tokens do not exist.

The mask makes the parallel computation equivalent to the left-to-right factorisation:

$$p(x_1,\dots,x_T)=\prod_{t=1}^{T} p(x_t \mid x_{<t})$$

## Implementation

```python
import numpy as np

T = 4
mask = np.triu(np.ones((T, T), dtype=bool), k=1)   # True above the diagonal
scores = np.where(mask, -np.inf, scores)            # before softmax
```

Row $$i$$ of the softmax then has non-zero weights only on columns $$0..i$$:

| | key 0 | key 1 | key 2 | key 3 |
|---|---|---|---|---|
| query 0 | allowed | masked | masked | masked |
| query 1 | allowed | allowed | masked | masked |
| query 2 | allowed | allowed | allowed | masked |
| query 3 | allowed | allowed | allowed | allowed |

## Pitfalls

- **Adding 0 or a small number does not mask.** Use $$-\infty$$ (or the dtype's most negative value in half precision).
- **Fully masked rows** (for example padding positions) give NaN after softmax. Handle them separately.
- **Padding mask is different.** The causal mask hides the future; the padding mask hides pad tokens. Real code combines both.
- **Leak bugs** show up as suspiciously low training loss with garbage generations.

## Where it is and is not used

- Decoder self-attention: causal mask.
- Encoder self-attention (BERT) and cross-attention: no causal mask.
- Prefix-LM setups: bidirectional attention over the prefix, causal over the rest.

## Inference note

With a KV cache, the newest token attends to all cached keys, so the mask is implicit: there are no future keys to hide.

## Interview follow-up

*"Does masking make training slower than inference?"* No. Training processes all positions at once with one masked matrix multiply, which is why it is far more parallel than generation.
