```python
import math, torch, torch.nn as nn, torch.nn.functional as F

class GQA(nn.Module):
    def __init__(self, d_model, n_heads, n_kv_heads=None):
        super().__init__()
        n_kv_heads = n_kv_heads or n_heads            # equal -> standard MHA
        assert n_heads % n_kv_heads == 0
        self.h, self.kv, self.dh = n_heads, n_kv_heads, d_model // n_heads
        self.q = nn.Linear(d_model, n_heads * self.dh, bias=False)
        self.k = nn.Linear(d_model, n_kv_heads * self.dh, bias=False)   # smaller when kv < h
        self.v = nn.Linear(d_model, n_kv_heads * self.dh, bias=False)
        self.o = nn.Linear(n_heads * self.dh, d_model, bias=False)

    def forward(self, x):
        B, T, _ = x.shape
        q = self.q(x).view(B, T, self.h, self.dh).transpose(1, 2)     # (B, h, T, dh)
        k = self.k(x).view(B, T, self.kv, self.dh).transpose(1, 2)    # (B, kv, T, dh)
        v = self.v(x).view(B, T, self.kv, self.dh).transpose(1, 2)
        rep = self.h // self.kv
        k = k.repeat_interleave(rep, dim=1)                           # share each KV head with `rep` query heads
        v = v.repeat_interleave(rep, dim=1)
        att = (q @ k.transpose(-2, -1)) / math.sqrt(self.dh)          # (B, h, T, T)
        mask = torch.triu(torch.ones(T, T, dtype=torch.bool, device=x.device), 1)
        att = att.masked_fill(mask, float("-inf")).softmax(-1)
        y = (att @ v).transpose(1, 2).reshape(B, T, self.h * self.dh)
        return self.o(y)

x = torch.randn(2, 6, 64)
print(GQA(64, 8)(x).shape, GQA(64, 8, 2)(x).shape, GQA(64, 8, 1)(x).shape)  # MHA, GQA, MQA
```

**Variants:** `n_kv_heads = n_heads` is **MHA**, `1` is **MQA**, anything in between is **GQA** (e.g. 8 query heads, 2 KV heads: each KV head serves 4 query heads).

**What it buys:** attention FLOPs barely change, but the **KV cache shrinks by `n_heads / n_kv_heads`**, which is the main memory and bandwidth cost at inference. Example: 32 heads to 8 KV heads gives a 4x smaller cache. Quality is close to MHA, much better than MQA. Models can be **uptrained** from MHA checkpoints by mean-pooling KV heads within each group.
