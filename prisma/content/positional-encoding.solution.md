## Short answer

Self-attention treats its input as a *set*: if you shuffle the tokens, each token's output is just shuffled along with them (it is permutation-equivariant). "dog bites man" and "man bites dog" would look the same. Positional encoding injects order information so the model can tell positions apart.

## Main approaches

| Method | How it works | Used by | Notes |
|---|---|---|---|
| Sinusoidal (absolute) | Fixed sine/cosine vectors added to the embeddings | Original Transformer | No parameters; extrapolates poorly in practice |
| Learned absolute | A trainable vector per position | BERT, GPT-2 | Hard limit at the trained maximum length |
| Relative bias | Learned bias on attention scores by distance | T5 | Generalises to offsets rather than positions |
| **RoPE** | Rotates $$Q$$ and $$K$$ by an angle that depends on position, so $$q\cdot k$$ depends on relative offset | Llama family and many others | Context can be extended by rescaling |
| ALiBi | Subtracts a linear penalty proportional to distance from attention scores | Some open models | Good length extrapolation |

Sinusoidal formula:

$$PE_{(pos,2i)}=\sin\!\left(\frac{pos}{10000^{2i/d}}\right),\qquad PE_{(pos,2i+1)}=\cos\!\left(\frac{pos}{10000^{2i/d}}\right)$$

Different dimensions oscillate at different wavelengths, so each position gets a distinct pattern, and the encoding of position $$pos+k$$ is a linear function of the encoding of $$pos$$.

## Why the choice matters in practice

- **Context extension:** a model trained on 4k tokens degrades beyond that. RoPE-based models are extended with position interpolation, NTK-aware scaling or YaRN, usually followed by a little long-context fine-tuning.
- **Placement:** absolute encodings are added once at the input; RoPE and ALiBi act inside every attention layer.
- **Nuance:** in causal decoders the mask itself leaks some order information, and research on "NoPE" models suggests they can work without explicit encodings, but mainstream LLMs still use RoPE or similar.

## Interview follow-up

*"Why is RoPE preferred over learned positions?"* It encodes relative distance directly in the dot product, adds no parameters, and can be rescaled to longer contexts.
