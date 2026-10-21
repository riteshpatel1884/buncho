Notation: batch $B$, length $T$, width $d$, heads $h$, head size $d_h=d/h$, vocabulary $V$.

## Step by step

**1. Tokenise.** Text becomes integer IDs, shape $(B,T)$.

**2. Embed.** Look up rows of $E\in\mathbb{R}^{V\times d}$: output $X\in\mathbb{R}^{B\times T\times d}$. Models with learned or sinusoidal positions add a position vector here. Models with **RoPE** apply positions later, inside attention.

**3. For each of the $N$ blocks (pre-norm layout):**

*a. Attention sublayer*
1. Normalise: $\hat X=\text{RMSNorm}(X)$.
2. Project: $Q=\hat XW_Q,\;K=\hat XW_K,\;V=\hat XW_V$, each $(B,T,d)$. With GQA, $K$ and $V$ have fewer heads.
3. Split into heads: $(B,h,T,d_h)$. Apply RoPE to $Q$ and $K$ if used.
4. Scores: $S=QK^\top/\sqrt{d_h}$, shape $(B,h,T,T)$.
5. **Causal mask:** set entries where key position > query position to $-\infty$.
6. $A=\text{softmax}(S)$ over the key axis, then context $=AV$, shape $(B,h,T,d_h)$.
7. Concatenate heads to $(B,T,d)$ and apply $W_O$.
8. **Residual:** $X\leftarrow X+\text{attn\_out}$.

*b. Feed-forward sublayer*
1. Normalise, then expand $d\to d_{ff}$ (about $4d$; SwiGLU uses a gated variant), apply the non-linearity, project back to $d$.
2. **Residual:** $X\leftarrow X+\text{ffn\_out}$.

**4. Final norm** on $X$.

**5. LM head.** Multiply by $W_{out}\in\mathbb{R}^{d\times V}$ (often tied to $E^\top$): logits of shape $(B,T,V)$.

**6. Loss or sampling.**
- *Training:* cross-entropy between logits at position $t$ and the actual token $t+1$, for **all positions in parallel**.
- *Generation:* take only the **last position's** logits, apply temperature, top-k or top-p, sample one token.

## Generation differs from training

- **Prefill:** the whole prompt runs in one parallel pass exactly as above, and every layer's $K$ and $V$ are stored in the **KV cache**.
- **Decode:** each new step feeds **one token**: $Q$ has length 1, new $K,V$ are appended to the cache, and attention reads the cached history. Cost per step is linear in context length instead of recomputing $T^2$.
- Prefill is compute-bound; decode is memory-bandwidth-bound.

## Sanity numbers

Per layer, attention has about $4d^2$ weights and the FFN about $8d^2$, so total parameters are roughly $12Nd^2+Vd$. The attention score tensor is $O(T^2)$ per head, which FlashAttention avoids materialising in GPU memory.
