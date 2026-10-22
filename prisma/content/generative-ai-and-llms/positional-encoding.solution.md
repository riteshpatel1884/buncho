## The problem

Self-attention treats its input as a **set**. If you shuffle the tokens, each token's output is just shuffled with it. The operation is **permutation-equivariant**, so "the dog chased the cat" and "the cat chased the dog" would produce the same token representations. Unlike an RNN, nothing in the architecture encodes order, so position must be injected.

## Original solution: sinusoidal encoding (Vaswani et al., 2017)

Add a fixed vector to each token embedding:

$$PE_{(pos,2i)}=\sin\!\left(\frac{pos}{10000^{2i/d}}\right),\qquad PE_{(pos,2i+1)}=\cos\!\left(\frac{pos}{10000^{2i/d}}\right)$$

- Each dimension pair is a sinusoid with a different wavelength, from $2\pi$ up to $10000\cdot2\pi$, like digits of a number counting at different speeds.
- For any fixed offset $k$, $PE_{pos+k}$ is a **linear function** of $PE_{pos}$ (a rotation), so relative offsets are easy to learn.
- No parameters, and it can be evaluated at positions never seen in training (though quality degrades when extrapolating far).

## Other approaches

| Method | How | Used in |
|---|---|---|
| **Learned absolute** | A trainable embedding per position index, added to token embeddings | BERT, GPT-2 |
| **Relative bias** | Attention score gets a learned bias depending on distance $i-j$ | T5 |
| **RoPE** (rotary) | Rotate $Q$ and $K$ by an angle proportional to position, so $q_i\cdot k_j$ depends on $i-j$ | Llama, Qwen, Mistral and most modern LLMs |
| **ALiBi** | Subtract a head-specific linear penalty $m\cdot|i-j|$ from scores | BLOOM, MPT |

**Why RoPE won:** it encodes relative position directly in the attention dot product, adds no learned parameters, decays naturally with distance, and can be rescaled (position interpolation, NTK scaling, YaRN) to extend context length.

**Learned absolute embeddings** are simple but cap the model at the maximum trained length and do not generalise to longer inputs.

## Notes worth saying in an interview

- Absolute encodings are **added to the input** once; RoPE and ALiBi act **inside every attention layer**.
- Decoder-only models with a causal mask can infer *some* ordering implicitly (each token sees a different-length prefix), but explicit positions are still used and work much better.
- Context-length extension is mostly a **positional encoding problem**: the model must handle positions larger than any it saw in pre-training.
