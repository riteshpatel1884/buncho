**Formula**

`RMSNorm(x) = g * x / sqrt( mean(x^2) + eps )`

It rescales by the root mean square only. Unlike LayerNorm it does **not subtract the mean** and usually has **no bias** term.

```python
import torch, torch.nn as nn

class RMSNorm(nn.Module):
    def __init__(self, d, eps=1e-6):
        super().__init__()
        self.g = nn.Parameter(torch.ones(d)); self.eps = eps
    def forward(self, x):
        return x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps) * self.g
```

**Why it works:** the main benefit of normalisation comes from re-scaling (keeping activation magnitude stable), not from re-centring. Dropping the mean calculation removes a reduction and a parameter set.

**Benefits:** roughly 7 to 64% faster than LayerNorm in reported measurements, fewer parameters, and equal quality in practice. It is memory-bound, so fused kernels matter.

**Used by:** Llama family, Mistral, Gemma, Qwen and most recent open LLMs, typically in a pre-norm position.

**Caveat:** compute the mean-square in FP32 to avoid overflow when training in FP16/BF16.
