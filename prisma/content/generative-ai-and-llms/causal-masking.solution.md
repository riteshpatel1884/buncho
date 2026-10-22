## Definition

**Causal masking** (also called look-ahead masking) forces each position to attend only to itself and **earlier** positions. Token $i$ may use tokens $1..i$ but never $i+1..T$.

## Why it is needed

An autoregressive model is trained to predict token $t+1$ from tokens $\le t$. In a Transformer the whole sequence is processed **in parallel** during training. Without a mask, position $t$ could simply read token $t+1$ through attention and copy it, so the loss would drop to zero while the model learned nothing useful, and it would fail at generation time when future tokens do not exist.

The mask makes the parallel training pass **equivalent to $T$ separate left-to-right predictions**, so one forward pass gives $T$ training signals.

## How it works

After computing scores $S=QK^\top/\sqrt{d_k}$ (shape $T\times T$), add a mask $M$ before softmax:

$$M_{ij}=\begin{cases}0 & j\le i\\ -\infty & j>i\end{cases},\qquad A=\text{softmax}(S+M)$$

Since $e^{-\infty}=0$, masked positions get exactly zero weight and each row still sums to 1. The mask is a **lower-triangular** pattern:

```
      k1 k2 k3 k4
q1    ✓  ✗  ✗  ✗
q2    ✓  ✓  ✗  ✗
q3    ✓  ✓  ✓  ✗
q4    ✓  ✓  ✓  ✓
```

Setting masked scores to $0$ would be **wrong**: $e^0=1$, so those positions would still receive weight. It must be $-\infty$ (or a very large negative number).

```python
import torch

def causal_attention(q, k, v):
    T = q.size(-2)
    scores = q @ k.transpose(-2, -1) / q.size(-1) ** 0.5
    mask = torch.triu(torch.ones(T, T, dtype=torch.bool, device=q.device), diagonal=1)
    scores = scores.masked_fill(mask, float('-inf'))
    return torch.softmax(scores, dim=-1) @ v
```

## Causal mask vs padding mask

| | Causal mask | Padding mask |
|---|---|---|
| Purpose | Hide future tokens | Ignore pad tokens used to batch unequal lengths |
| Shape | Triangular, same for every sequence | Depends on each sequence's length |
| Used in | Decoder self-attention | Encoders, decoders, cross-attention |

Real systems **combine both** by adding the two masks.

## Related points

- **Encoder-only models (BERT)** use no causal mask: every token sees the whole sequence (bidirectional).
- **Decoder-only models** use it in every layer. This is also what makes the **KV cache** valid: earlier tokens' keys and values never depend on later tokens, so they can be cached and reused.
- **Prefix-LM** designs let the prompt part attend bidirectionally and only mask the generated part.
- **Cross-attention** has no causal mask because the whole source is known.
- Cost: the mask does not reduce computation by itself in a naive implementation. FlashAttention-style kernels skip fully masked blocks to save about half the work.
