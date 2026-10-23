**Formula**

`Attention(Q, K, V) = softmax( Q K^T / sqrt(d_k) ) V`

**Roles**

- **Query (Q):** what this token is looking for.
- **Key (K):** what each token offers to be matched against.
- **Value (V):** the information that is actually passed on when a token is attended to.

Each token's output is a weighted average of all value vectors, where the weights come from how well its query matches each key (dot product, then softmax so weights sum to 1). Q, K, V are linear projections of the same input in *self*-attention.

**Why divide by `sqrt(d_k)`.** If query and key components have mean 0 and variance 1, the dot product of two `d_k`-dimensional vectors has variance `d_k`. Large scores push softmax into saturation, where one weight is about 1 and the gradients are about 0, so training stalls. Dividing by `sqrt(d_k)` restores unit variance.

```python
import math, torch

def attention(q, k, v, causal=False):
    # q, k, v: [batch, heads, seq, d_k]
    scores = q @ k.transpose(-2, -1) / math.sqrt(q.size(-1))      # [B, H, T, T]
    if causal:
        T = scores.size(-1)
        mask = torch.triu(torch.ones(T, T, dtype=torch.bool, device=q.device), 1)
        scores = scores.masked_fill(mask, float("-inf"))           # hide future tokens
    weights = scores.softmax(dim=-1)
    return weights @ v, weights
```

**Complexity.** Time `O(n^2 * d)` and memory `O(n^2)` for the score matrix (per head), which is why long contexts are expensive and why Flash Attention, sliding windows and KV caching exist.

**Related ideas:** multi-head attention runs several of these in parallel on lower-dimensional projections; positional information must be added separately because attention itself is permutation-invariant.
