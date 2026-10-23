**Idea:** instead of adding a position vector to the input, **rotate** the query and key vectors by an angle that depends on their position. Pair up dimensions `(x_{2i}, x_{2i+1})` and rotate each pair by `m * theta_i` for position `m`:

`R(m theta) = [[cos m theta, -sin m theta], [sin m theta, cos m theta]]`,  `theta_i = 10000^(-2i/d)`

```python
def rope(x, pos, base=10000.0):            # x: [T, d], d even
    d = x.size(-1)
    theta = base ** (-torch.arange(0, d, 2) / d)       # [d/2]
    ang = pos[:, None] * theta[None, :]                # [T, d/2]
    cos, sin = ang.cos(), ang.sin()
    x1, x2 = x[..., 0::2], x[..., 1::2]
    out = torch.empty_like(x)
    out[..., 0::2] = x1 * cos - x2 * sin
    out[..., 1::2] = x1 * sin + x2 * cos
    return out                                          # apply to Q and K only
```

**Key property:** the attention score between positions `m` and `n` is

`(R_m q) . (R_n k) = q . R_(n-m) k`

so it depends only on the **relative offset** `n - m`, while still being computed from absolute positions.

**Advantages over learned absolute embeddings**

- Relative position built in; no extra parameters.
- Decays naturally with distance (high-frequency pairs).
- Works with the KV cache (keys are rotated once).
- Context can be extended by rescaling positions (position interpolation, NTK-aware scaling, YaRN).

**Limitations:** quality degrades beyond the trained length unless scaled and fine-tuned. Used by Llama, Mistral, Qwen, Gemma and many others.
