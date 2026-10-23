**Dense model:** every token passes through all parameters, so compute per token is proportional to total parameters.

**MoE:** in each (or every other) Transformer block the single feed-forward network is replaced by `E` expert FFNs plus a small **router**. For every token the router picks the **top-k** experts (for example 2 of 8 in Mixtral), runs only those, and combines their outputs weighted by the router probabilities. Attention layers stay dense.

```python
def moe_layer(x, router, experts, k=2):
    probs = router(x).softmax(-1)            # [tokens, E]
    w, idx = probs.topk(k, dim=-1)
    w = w / w.sum(-1, keepdim=True)
    out = torch.zeros_like(x)
    for j in range(k):
        for e, expert in enumerate(experts):
            m = idx[:, j] == e
            if m.any():
                out[m] += w[m, j, None] * expert(x[m])
    return out
```

**Dense vs sparse**

| | Dense | Sparse (MoE) |
|---|---|---|
| Active params per token | All | A fraction (e.g. about 13B of 47B in Mixtral 8x7B) |
| Capacity for given compute | Lower | Higher |
| Memory | Proportional to params | **All experts must stay in memory** |
| Training | Simple | Needs load balancing |

**Challenges:** router collapse (a few experts get all tokens) is handled by an auxiliary load-balancing loss or bias-based balancing, capacity limits, and expert parallelism with all-to-all communication. Fine-tuning and batching are harder than for dense models.

**Takeaway:** MoE decouples knowledge capacity from per-token compute, at the cost of memory and system complexity.
