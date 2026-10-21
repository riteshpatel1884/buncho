## Short answer

Token ids become embeddings, pass through a stack of blocks (attention, then feed-forward, each with a residual connection and normalisation), and end in a linear layer that produces one logit per vocabulary entry at every position. Training uses all positions at once; inference uses the last position and loops.

## Step by step

Let $$B$$ = batch size, $$T$$ = sequence length, $$d$$ = model width, $$h$$ = number of heads, $$d_h = d/h$$, $$V$$ = vocabulary size, $$L$$ = number of layers.

1. **Embed.** ids $$[B,T]$$ become embeddings $$[B,T,d]$$ through a lookup table. With learned or sinusoidal positions, the position vector is added here. With RoPE, positions are applied later to $$Q$$ and $$K$$.
2. **For each of the $$L$$ layers** (pre-norm form):
    1. $$x \leftarrow x + \text{Attn}(\text{Norm}(x))$$
    2. $$x \leftarrow x + \text{FFN}(\text{Norm}(x))$$
3. **Final norm, then the LM head:** $$[B,T,d]\times[d,V]\rightarrow$$ logits $$[B,T,V]$$.
4. **Loss (training).** Cross-entropy between the logits at position $$t$$ and the actual token at $$t+1$$, for every position in parallel.
5. **Sample (inference).** Take the logits at the last position, apply softmax with temperature and top-p, pick a token, append it, repeat.

## Inside attention

1. Project: $$Q=xW_Q,\; K=xW_K,\; V=xW_V$$, then split into $$h$$ heads: $$[B,h,T,d_h]$$.
2. Scores: $$QK^\top/\sqrt{d_h}$$ gives $$[B,h,T,T]$$.
3. Add the causal mask ($$-\infty$$ above the diagonal) and softmax over the last axis.
4. Multiply by $$V$$ to get $$[B,h,T,d_h]$$.
5. Concatenate heads to $$[B,T,d]$$ and apply the output projection $$W_O$$.

## Inside the FFN

Expand each token from $$d$$ to a hidden size (about $$4d$$, or about $$\tfrac{8}{3}d$$ with SwiGLU), apply the non-linearity, and project back to $$d$$.

## Training vs. inference

| | Training | Inference |
|---|---|---|
| Positions processed | All $$T$$ in parallel | Prompt in parallel (prefill), then one new token per step |
| Loss | Every position | None |
| KV cache | Not used | Stores each layer's $$K,V$$ for past tokens so they are not recomputed |

## Interview follow-up

*"Where does the compute go?"* At normal lengths the matrix multiplications in the attention projections and the FFN dominate. The $$T\times T$$ attention term grows quadratically and dominates at long context.
