## Definition

Instead of one attention operation over the full width $d$, **multi-head attention (MHA)** runs $h$ attention operations in parallel, each in a lower-dimensional subspace of size $d_k=d/h$, then combines the results.

$$\text{head}_i=\text{Attention}(XW_Q^{(i)},\,XW_K^{(i)},\,XW_V^{(i)})$$

$$\text{MHA}(X)=\text{Concat}(\text{head}_1,\dots,\text{head}_h)\,W_O$$

In practice the per-head projections are one big matrix $W_Q\in\mathbb{R}^{d\times d}$ that is **reshaped** into $h$ heads, so it is a single efficient matmul.

## Shapes

$X:(B,T,d)\;\to\;Q,K,V:(B,h,T,d_k)\;\to\;\text{scores}:(B,h,T,T)\;\to\;\text{out}:(B,T,d)$ after concatenation and $W_O$.

Example: $d=512$, $h=8$ gives $d_k=64$ (the original Transformer).

## Why multiple heads?

- **Different relations at once.** One softmax produces one weighted average, so a single head must blend everything into one pattern. Separate heads can specialise: one tracks the previous token, one links verbs to subjects, one handles coreference, one does copying (induction heads).
- **Different subspaces.** Each head projects into its own subspace, so it can match on different features of the token.
- **Smoother optimisation and robustness.** Several moderately sized heads work better than one wide head in practice, and several heads are redundant enough that some can be pruned with little loss.

## Cost

| | Single head, width $d$ | $h$ heads, width $d/h$ each |
|---|---|---|
| Projection params | $3d^2$ | $3d^2$ (same) |
| Output projection | $d^2$ | $d^2$ |
| Total attention params | $4d^2$ | $4d^2$ |
| Score compute | $T^2d$ | $h\cdot T^2\cdot(d/h)=T^2d$ (same) |
| Score memory | $T^2$ | $h\,T^2$ (more) |

So multiple heads are **free in parameters and FLOPs**, but they store $h$ attention matrices and make the KV cache larger.

## Inference variants

The KV cache stores $K$ and $V$ for every head, which dominates memory in long-context serving. Fixes:

- **MQA (multi-query attention):** all query heads share **one** K/V head.
- **GQA (grouped-query attention):** query heads are split into groups, each sharing one K/V head. This is the usual compromise (Llama 2 70B, Llama 3, Mistral), cutting KV cache several-fold with little quality loss.

## Common misconceptions

- Heads do not each see a different *part of the sequence*; every head sees all positions, but a different *projection* of the features.
- Not every head is interpretable or useful, and some are nearly duplicates.
