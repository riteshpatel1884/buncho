## Definition

Each token is projected into a query $q$, key $k$ and value $v$. A token's query is compared with every key to decide how much of each value to mix into its output:

$$
\text{Attention}(Q, K, V) = \text{softmax}\!\left(\frac{Q K^\top}{\sqrt{d_k}}\right) V
$$

- **Query**: what this token is looking for.
- **Key**: what each token offers for matching.
- **Value**: the information actually passed along.

The softmax turns similarity scores into weights that sum to 1, so the output is a weighted average of value vectors.

## Why scale by $\sqrt{d_k}$

If query and key components are roughly independent with unit variance, the dot product $q \cdot k$ has variance about $d_k$. Large magnitudes push softmax into saturated regions where one weight is close to 1 and gradients are tiny. Dividing by $\sqrt{d_k}$ restores roughly unit variance.

## Multiple heads

Several smaller attention operations run in parallel, each with its own projections, and their outputs are concatenated and projected. Different heads can specialise in different relationships (for example local syntax versus long-range reference) without increasing total cost much.

## Masking and cost

- Decoder-only models use a **causal mask** so a token cannot attend to future tokens.
- The score matrix is $n \times n$, so time and memory are $O(n^2)$ in sequence length $n$. This is why long contexts are expensive, and why techniques such as FlashAttention (memory-efficient exact attention), sparse or sliding-window attention, and KV caching during generation matter.

## Minimal implementation

```python
import math
import torch

def attention(q, k, v, mask=None):
    # q, k, v: (batch, heads, seq, d_k); mask: bool, True = may attend
    scores = q @ k.transpose(-2, -1) / math.sqrt(q.size(-1))
    if mask is not None:
        scores = scores.masked_fill(~mask, float("-inf"))
    weights = torch.softmax(scores, dim=-1)
    return weights @ v
```
