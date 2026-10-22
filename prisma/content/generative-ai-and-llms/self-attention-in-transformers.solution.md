## Definition

**Self-attention** lets every token in a sequence compute a new representation as a **weighted combination of all tokens in the same sequence**. "Self" means queries, keys and values all come from the **same** input $X$.

## Step by step

For input $X\in\mathbb{R}^{T\times d}$:

1. **Project** to $Q=XW_Q$, $K=XW_K$, $V=XW_V$.
2. **Score** every pair: $S=QK^\top/\sqrt{d_k}$, a $T\times T$ matrix. $S_{ij}$ measures how much token $i$ should attend to token $j$.
3. **Mask** (decoder only): set $S_{ij}=-\infty$ for $j>i$ so a token cannot see the future.
4. **Normalise:** $A=\text{softmax}(S)$ row-wise. Row $i$ is a probability distribution over the tokens it reads from.
5. **Mix:** $O=AV$. Each output row is a weighted average of value vectors.
6. **Multi-head:** do this in $h$ parallel heads, concatenate, and apply $W_O$.

## What it achieves

- **Contextualisation.** The vector for "bank" becomes different next to "river" than next to "loan". Meaning is resolved by the context.
- **Direct long-range links.** Token 1 and token 1,000 interact in a single layer ($O(1)$ path length), unlike an RNN that must carry information through every intermediate step.
- **Full parallelism.** All positions are computed at once in matrix multiplications, which is why Transformers train efficiently on GPUs.
- **Interpretable-ish structure.** Heads often specialise (previous-token, syntax, coreference, induction heads for copying).

## Complexity

| | Value |
|---|---|
| Time per layer | $O(T^2 d)$ |
| Memory for scores | $O(T^2)$ per head |
| Parameters | $4d^2$ (independent of $T$) |

The **quadratic cost in sequence length** is the main limitation. Mitigations: **FlashAttention** (exact, tiles the computation so the $T\times T$ matrix is never stored in GPU main memory), **sliding-window and sparse attention**, **GQA/MQA**, and **KV-cache** compression.

## Caveats

- Attention has **no inherent notion of order**, so positional information must be added.
- Attention weights show where the model looked, but are not a faithful explanation of *why* it produced an output.

## Minimal implementation (PyTorch)

```python
import torch, math

def self_attention(x, Wq, Wk, Wv, causal=True):
    q, k, v = x @ Wq, x @ Wk, x @ Wv                  # (T, d)
    scores = q @ k.T / math.sqrt(k.shape[-1])          # (T, T)
    if causal:
        mask = torch.triu(torch.ones_like(scores), 1).bool()
        scores = scores.masked_fill(mask, float('-inf'))
    return torch.softmax(scores, dim=-1) @ v
```
