## Short answer

The Transformer (Vaswani et al., 2017, *Attention Is All You Need*) is a sequence model built from **attention** and feed-forward layers instead of recurrence or convolution. Every token can look directly at every other token, and all positions are processed in parallel during training.

## Architecture

The original model is an encoder–decoder:

- **Input:** token embeddings plus positional information.
- **Encoder** ($$N$$ identical layers): multi-head self-attention, then a feed-forward network, each wrapped in a residual connection and layer normalisation.
- **Decoder** ($$N$$ identical layers): masked self-attention, then cross-attention over the encoder output, then a feed-forward network, with the same residual and normalisation wrapping.
- **Output:** a linear layer over the vocabulary followed by softmax.

The core operation:

$$\text{Attention}(Q,K,V)=\text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$$

The base model in the paper used $$d_{model}=512$$, 8 heads, $$d_{ff}=2048$$ and 6 layers per stack.

## Why it replaced RNNs

| Property | RNN / LSTM | Transformer |
|---|---|---|
| Parallelism across the sequence in training | No (sequential) | Yes |
| Path between two distant tokens | $$O(n)$$ steps | $$O(1)$$ |
| Compute per layer | $$O(n \cdot d^2)$$ | $$O(n^2 \cdot d)$$ |
| Attention memory | none | $$O(n^2)$$ per head (naive) |

The price is quadratic cost in sequence length, which drives most long-context engineering.

## Variants

- **Encoder-only** (BERT): bidirectional, good for understanding and embeddings.
- **Decoder-only** (GPT, Llama and most current chat LLMs): causal, good for generation.
- **Encoder–decoder** (T5, the original translation model): good for input-to-output transformation.

## Interview follow-up

*"What changed in modern LLM Transformers?"* Pre-norm placement, RMSNorm, RoPE positions, SwiGLU feed-forward layers, grouped-query attention and FlashAttention are the common upgrades.
