A Transformer block stack is built from a small set of parts. Each one solves a specific problem.

## 1. Tokenizer and embedding layer
Maps token IDs to dense vectors of size $d_{model}$ using a learned table $E\in\mathbb{R}^{V\times d}$. **Why:** neural networks need continuous vectors, and similar tokens should get similar representations.

## 2. Positional information
Sinusoidal, learned, relative, or rotary (RoPE) encodings. **Why:** self-attention is permutation-invariant, so without positions "dog bites man" and "man bites dog" look identical.

## 3. Multi-head self-attention
Projects the input to queries, keys and values, computes $\text{softmax}(QK^\top/\sqrt{d_k})V$ in several heads in parallel, concatenates, and applies an output projection $W_O$. **Why:** it mixes information **across positions**. Multiple heads let the model attend to different relations (syntax, coreference, position) at once.

## 4. Causal mask (decoder)
Sets scores for future positions to $-\infty$ before softmax. **Why:** during training the model must not see the token it is predicting.

## 5. Feed-forward network (FFN / MLP)
Two linear layers with a non-linearity (GELU, or SwiGLU in modern models), expanding to about $4d$ and projecting back. Applied to each position independently. **Why:** it adds non-linear capacity and acts as the main store of factual knowledge. Roughly **two thirds of a layer's parameters** live here.

## 6. Residual (skip) connections
$x \leftarrow x + \text{Sublayer}(x)$. **Why:** they give gradients a direct path through depth, which makes very deep stacks trainable.

## 7. Normalisation
LayerNorm, or RMSNorm in modern LLMs, placed before each sublayer (**pre-norm**). **Why:** stabilises activations and gradients; pre-norm trains more reliably than post-norm at depth.

## 8. Output head
Final norm, a linear projection to vocabulary size (often **weight-tied** with the embedding matrix), then softmax. **Why:** converts the last hidden state into next-token probabilities.

## 9. Cross-attention (encoder-decoder only)
Queries from the decoder, keys and values from the encoder output. **Why:** lets the decoder condition on the source sequence.

## Putting it together

$$h \leftarrow h + \text{MHA}(\text{Norm}(h)),\qquad h \leftarrow h + \text{FFN}(\text{Norm}(h))$$

repeated for $N$ layers. Per layer, parameters are about $4d^2$ for attention and $8d^2$ for the FFN, so about $12\,d^2$ in total.
