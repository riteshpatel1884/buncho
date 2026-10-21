## Short answer

**Cross-attention** is attention where the queries come from one sequence and the keys and values come from a *different* one. It is how one stream of information reads from another.

$$\text{CrossAttn}(X_{dec}, X_{enc}) = \text{softmax}\!\left(\frac{(X_{dec}W_Q)(X_{enc}W_K)^\top}{\sqrt{d_k}}\right)(X_{enc}W_V)$$

## Self vs. cross attention

| | Self-attention | Cross-attention |
|---|---|---|
| $$Q$$ from | The sequence itself | The target / decoder side |
| $$K, V$$ from | The same sequence | The source / encoder side |
| Score matrix shape | $$[T, T]$$ | $$[T_{dec}, T_{enc}]$$ |
| Causal mask | Yes in decoders | No: the decoder may read the whole source |
| Purpose | Mix information within a sequence | Condition one sequence on another |

## Where it is used

- **Encoder–decoder translation and summarisation** (original Transformer, T5, BART): decoder reads the encoded source sentence.
- **Speech recognition** (Whisper): the text decoder attends to the audio encoder's output.
- **Diffusion models** (Stable Diffusion): image features attend to text-prompt embeddings to follow the prompt.
- **Some vision-language models** (Flamingo-style): language layers attend to visual tokens.

Most chat LLMs are **decoder-only** and do not use cross-attention. They place the extra context in the prompt and rely on self-attention.

## Engineering notes

- During decoding, the encoder's $$K$$ and $$V$$ are computed **once** and reused for every generated token.
- Cost is $$O(T_{dec}\cdot T_{enc})$$, so a very long source makes every decoding step more expensive.

## Interview follow-up

*"How does a decoder-only model use a retrieved document without cross-attention?"* The document is simply tokens in the prompt, and ordinary causal self-attention lets later tokens read it.
