## Short answer

**Multi-head attention** runs several attention operations in parallel, each on its own learned lower-dimensional projection of the input, then concatenates the results and mixes them with an output projection.

$$\text{MHA}(X)=\text{Concat}(\text{head}_1,\dots,\text{head}_h)\,W_O,\qquad \text{head}_i=\text{Attention}(XW_Q^i,\,XW_K^i,\,XW_V^i)$$

with $$d_k = d_v = d_{model}/h$$.

## Why multiple heads

- **Different relations at once.** One softmax produces one weighting per token. With several heads, the model can attend to different things in the same layer, such as a nearby token, a syntactic partner and a coreferent mention.
- **Different subspaces.** Each head projects into its own subspace, so each can learn its own notion of similarity.
- **Same compute.** Because each head is $$d_{model}/h$$ wide, total cost is about that of a single full-width head.
- **Caveat:** studies find many heads are redundant and can be pruned with little loss, so "each head learns a distinct skill" is only partly true.

## Shapes

```python
def split_heads(x, h):               # [B, T, d] -> [B, h, T, d // h]
    B, T, d = x.shape
    return x.reshape(B, T, h, d // h).transpose(0, 2, 1, 3)
```

| Step | Shape |
|---|---|
| Input | $$[B, T, d]$$ |
| After projection and split | $$[B, h, T, d/h]$$ |
| Scores per head | $$[B, h, T, T]$$ |
| After weighting values | $$[B, h, T, d/h]$$ |
| After concatenation | $$[B, T, d]$$ |
| After $$W_O$$ | $$[B, T, d]$$ |

## Parameter count

$$W_Q, W_K, W_V, W_O$$ are each $$d \times d$$ when the heads are stacked, so attention has about $$4d^2$$ parameters **regardless of $$h$$**. More heads change how the width is divided, not the parameter count. The attention-score memory does grow with $$h$$: it is $$h \times T^2$$ per sequence.

## Variants

- **Multi-query attention (MQA):** all heads share one $$K$$ and $$V$$.
- **Grouped-query attention (GQA):** heads share $$K$$ and $$V$$ in groups. Used by many current LLMs because it shrinks the KV cache with little quality loss.

## Interview follow-up

*"What is the downside of too many heads?"* Each head becomes very narrow (small $$d_k$$), which limits what a single head can represent.
