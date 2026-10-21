## Short answer

The **feed-forward network (FFN)** in a Transformer block is a small MLP applied to every token position independently:

$$\text{FFN}(x)=W_2\,\sigma(W_1 x + b_1) + b_2$$

It expands each token from $$d$$ to a larger hidden size, applies a non-linearity, and projects back to $$d$$. In the original Transformer, $$d=512$$ and the hidden size was $$2048$$ (a $$4\times$$ expansion).

## What it does that attention does not

- **Attention mixes information across tokens**, but it is mostly a weighted average of linear projections.
- **The FFN transforms each token on its own** and supplies the non-linearity and most of the capacity. Without the non-linearity, two stacked linear layers collapse into one.
- Research on trained models (Geva et al., 2021) suggests FFN layers behave like **key–value memories**, where many stored patterns, including factual associations, are triggered by features of the token's representation. Treat this as an informative interpretation, not a proven full account.

## Size

Per layer, with a $$4\times$$ hidden size:

| Part | Parameters |
|---|---|
| Attention ($$W_Q,W_K,W_V,W_O$$) | about $$4d^2$$ |
| FFN | about $$2\cdot d\cdot 4d = 8d^2$$ |

So roughly **two thirds of a block's parameters** live in the FFN.

## Modern variants

- **SwiGLU** (Llama, PaLM and others) replaces the single activation with a gated unit:

$$\text{FFN}(x)=W_2\big(\text{SiLU}(xW_1)\odot xW_3\big)$$

  The hidden size is reduced to about $$\tfrac{8}{3}d$$ so the parameter count stays near $$8d^2$$ even though there are three matrices.

```python
import torch.nn as nn
import torch.nn.functional as F

class SwiGLU(nn.Module):
    def __init__(self, d, hidden):
        super().__init__()
        self.w1 = nn.Linear(d, hidden, bias=False)
        self.w3 = nn.Linear(d, hidden, bias=False)
        self.w2 = nn.Linear(hidden, d, bias=False)

    def forward(self, x):
        return self.w2(F.silu(self.w1(x)) * self.w3(x))
```

- **Mixture of Experts (MoE)** replaces the single FFN with many expert FFNs and a router that activates only a few per token, so total parameters grow without a matching rise in per-token compute.

## Interview follow-up

*"Why is the FFN applied 'position-wise'?"* The same weights are applied to every token independently, so it adds no cross-token communication. All mixing between tokens happens in attention.
