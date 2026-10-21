## Short answer

A Transformer block combines a few ideas: token and positional representations, attention, a feed-forward network, residual connections, normalisation and (in decoders) masking. An output head turns the final vectors into token probabilities.

## Components

| Component | What it does | What breaks without it |
|---|---|---|
| Token embedding | Maps token ids to vectors of size $$d_{model}$$ | No continuous input for the network |
| Positional information | Sinusoidal, learned, RoPE or ALiBi | Attention ignores token order |
| Self-attention (Q, K, V) | Each token takes a weighted mix of other tokens' values | No information moves between positions |
| Multi-head attention | Several attention operations in parallel subspaces, concatenated and projected | Only one relation pattern per layer |
| Feed-forward network | Two-layer MLP applied to each token independently | Little non-linearity or capacity; holds most parameters |
| Residual connections | $$x + f(x)$$ around each sub-layer | Gradients vanish in deep stacks |
| Layer normalisation | Rescales activations per token | Unstable training |
| Causal mask | Blocks attention to future tokens | Decoder would see the answer it must predict |
| Cross-attention | Queries from the decoder, keys and values from the encoder | Decoder cannot read the source (encoder–decoder models only) |
| LM head + softmax | Projects to vocabulary logits | No next-token distribution |

## One block, in code

```python
def block(x, attn, ffn, norm1, norm2, mask):
    x = x + attn(norm1(x), mask)   # mix information across tokens
    x = x + ffn(norm2(x))          # transform each token independently
    return x
```

This is the **pre-norm** layout used by most modern models. The original paper used post-norm: $$\text{LayerNorm}(x + f(x))$$.

## Modern substitutions

RoPE for positions, RMSNorm for LayerNorm, SwiGLU for the ReLU feed-forward network, grouped-query attention for plain multi-head attention, and often tied input and output embeddings.

## Interview follow-up

*"Which part holds most of the parameters?"* The feed-forward network. With a $$4\times$$ hidden size, attention has about $$4d^2$$ parameters per layer and the FFN about $$8d^2$$.
