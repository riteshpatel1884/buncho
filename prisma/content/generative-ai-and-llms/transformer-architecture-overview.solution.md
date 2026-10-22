## The idea

The Transformer (Vaswani et al., 2017, *Attention Is All You Need*) processes a sequence with **self-attention** instead of recurrence. Every token can look directly at every other token, and all positions are computed **in parallel**.

## Original design (encoder-decoder, for translation)

- **Encoder** (N = 6 identical layers). Each layer: multi-head self-attention, then a position-wise feed-forward network, each wrapped in a residual connection and layer norm. It turns the source sentence into contextual vectors.
- **Decoder** (N = 6 layers). Each layer: **masked** self-attention over the tokens generated so far, **cross-attention** to the encoder output, then a feed-forward network.
- **Input:** token embeddings plus **positional encodings**, because attention itself has no notion of order.
- **Output:** linear layer to vocabulary size, then softmax for next-token probabilities.
- Base sizes: $d_{model}=512$, 8 heads, $d_{ff}=2048$.

Core operation:

$$\text{Attention}(Q,K,V)=\text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$$

## Why it beat RNNs and LSTMs

| | RNN/LSTM | Transformer |
|---|---|---|
| Parallelism over sequence | None (step by step) | Full during training |
| Path between distant tokens | $O(n)$ steps | $O(1)$ |
| Long-range dependencies | Vanishing gradients, forgetting | Direct connections |
| Cost per layer | $O(n\,d^2)$ | $O(n^2 d)$ |

The price is **quadratic cost in sequence length**, which motivates FlashAttention, sliding-window attention, GQA and KV-cache management.

## Three families

- **Encoder-only** (BERT): bidirectional, for understanding tasks such as classification and embeddings.
- **Decoder-only** (GPT, Llama, Claude-style LLMs): causal masked attention, next-token prediction. This is the dominant LLM design.
- **Encoder-decoder** (T5, original Transformer, Whisper): sequence-to-sequence tasks such as translation and speech recognition.

## What modern LLMs changed

Pre-norm with **RMSNorm**, **RoPE** positions, **SwiGLU** feed-forward layers, **grouped-query attention**, and sometimes **Mixture of Experts**. The overall structure (attention, feed-forward, residuals, stacked layers) is unchanged.
