**Post-LN (original):** `x = LN(x + Sublayer(x))`. The normalisation sits **on the residual path**, so the gradient must pass through a LayerNorm at every layer.

**Pre-LN:** `x = x + Sublayer(LN(x))`. The residual stream is an untouched identity path from the output to the first layer, and only the branch is normalised.

```python
class PreNormBlock(nn.Module):
    def forward(self, x):
        x = x + self.attn(self.norm1(x))
        x = x + self.mlp(self.norm2(x))
        return x                       # final norm applied once after the last block
```

**Why Pre-LN is more stable**

- Clean identity gradient path: gradients do not shrink or blow up with depth.
- Gradient scale at initialisation is more uniform across layers, so **no long learning-rate warm-up** is needed and larger learning rates work.
- Post-LN often diverges at depth (dozens of layers) without careful warm-up.

**Downsides of Pre-LN**

- The residual stream's magnitude grows with depth, so later layers contribute relatively less, which can give slightly lower final quality at equal depth.
- Variants fix this: DeepNorm, sandwich norm, QK-norm, extra post-norm in some models.

**Practice:** nearly all large decoder-only LLMs use Pre-LN (usually with RMSNorm) because stability at scale matters more than the small quality edge.
