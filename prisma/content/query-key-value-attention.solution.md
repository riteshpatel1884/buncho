## Intuition: a soft dictionary lookup

In a normal dictionary you match a **query** against **keys** and return the matching **value**. Attention does the same thing, but softly:

- **Query:** what this token is *looking for*.
- **Key:** what each token *advertises* about itself, used to be matched.
- **Value:** the *information* a token hands over when it is attended to.

A query is compared with every key; the comparison scores become weights; the output is the **weighted sum of the values**.

## Where they come from

Each token's input vector $x_i$ (dimension $d$) is multiplied by three **learned** matrices:

$$q_i=x_iW_Q,\qquad k_i=x_iW_K,\qquad v_i=x_iW_V$$

In matrix form, $Q=XW_Q,\;K=XW_K,\;V=XW_V$.

## The computation

$$\text{Attention}(Q,K,V)=\text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$$

1. **Scores:** $s_{ij}=q_i\cdot k_j/\sqrt{d_k}$, how relevant token $j$ is to token $i$.
2. **Weights:** softmax across $j$, so each row is non-negative and sums to 1.
3. **Output:** $o_i=\sum_j a_{ij}\,v_j$.

Shapes for sequence length $T$: $Q,K\in\mathbb{R}^{T\times d_k}$, $V\in\mathbb{R}^{T\times d_v}$, scores $T\times T$, output $T\times d_v$.

## Tiny example

Sentence: "The animal didn't cross the street because **it** was tired." The query for "it" should match the key of "animal" strongly, so the output for "it" becomes mostly the value of "animal", resolving the reference.

## Why three separate projections?

- **Different roles.** Matching ("is this relevant?") and carrying content ("what do I contribute?") are different jobs. Separate $W_K$ and $W_V$ let a token be *easy to find* for one reason while *contributing* something else.
- **Asymmetry.** With separate $W_Q$ and $W_K$, "A attends to B" need not equal "B attends to A". Using the raw $x_i\cdot x_j$ would force symmetric scores.
- **Capacity.** Learned projections let each head look at a different subspace of the representation (multi-head attention).

## In multi-head attention

$W_Q,W_K,W_V$ are split into $h$ heads of size $d_k=d/h$. Each head has its own Q, K, V subspaces and attends independently. Outputs are concatenated and mixed by $W_O$.

## In inference

$K$ and $V$ for past tokens never change, so they are cached (**KV cache**). Only the new token's $Q$ is computed each step. That is why the KV cache exists, and why $Q$ is not cached.
