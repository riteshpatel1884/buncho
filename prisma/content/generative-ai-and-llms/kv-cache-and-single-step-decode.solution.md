```python
import math, torch, torch.nn as nn

class CachedMHA(nn.Module):
    def __init__(self, d, h):
        super().__init__()
        self.h, self.dh = h, d // h
        self.qkv, self.o = nn.Linear(d, 3 * d, bias=False), nn.Linear(d, d, bias=False)

    def _split(self, t, B, T): return t.view(B, T, self.h, self.dh).transpose(1, 2)

    def forward(self, x, cache=None):
        # x: (B, T_new, d); cache: dict with "k","v" of shape (B, h, T_past, dh) or None
        B, T, d = x.shape
        q, k, v = self.qkv(x).chunk(3, dim=-1)
        q, k, v = (self._split(t, B, T) for t in (q, k, v))
        if cache is not None:
            k = torch.cat([cache["k"], k], dim=2)               # append new keys/values
            v = torch.cat([cache["v"], v], dim=2)
        new_cache = {"k": k, "v": v}
        S = k.shape[2]                                           # total length so far
        att = (q @ k.transpose(-2, -1)) / math.sqrt(self.dh)     # (B, h, T, S)
        # causal mask: new token i (absolute pos S-T+i) may see keys j <= S-T+i
        i = torch.arange(T).unsqueeze(1) + (S - T)
        j = torch.arange(S).unsqueeze(0)
        att = att.masked_fill(j > i, float("-inf")).softmax(-1)
        y = (att @ v).transpose(1, 2).reshape(B, T, d)
        return self.o(y), new_cache

torch.manual_seed(0)
m = CachedMHA(32, 4).eval()
x = torch.randn(1, 7, 32)
full, _ = m(x)                                   # reference: process all 7 tokens at once

out, cache = m(x[:, :5])                         # prefill with 5 tokens
outs = [out]
for t in range(5, 7):                            # decode one token at a time
    o, cache = m(x[:, t:t + 1], cache)
    outs.append(o)
assert torch.allclose(full, torch.cat(outs, 1), atol=1e-5)    # identical results
```

**Why it works:** in a causal model the keys and values of past tokens **never change**, so recomputing them every step is wasted work. The cache stores them; each decode step computes only the **new token's** Q, K, V and attends over the cached K/V.

**Cost:** per-step compute falls from $O(T^2)$ (recomputing the whole prefix) to $O(T)$; total generation from $O(T^3)$ to $O(T^2)$. The price is **memory**: $2\times\text{layers}\times\text{kv\_heads}\times d_{head}\times T\times\text{bytes}$ per sequence, growing linearly with length, so decode becomes **memory-bandwidth bound**. Mitigations: GQA/MQA, quantised caches, paged allocation, sliding windows, prefix caching.
