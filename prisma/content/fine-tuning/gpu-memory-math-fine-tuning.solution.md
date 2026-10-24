Let $N = 7\times10^9$ parameters.

**Full fine-tuning, mixed precision (bf16 compute, standard setup)**

| Item | Bytes/param | Memory |
|---|---|---|
| bf16 weights | 2 | 14 GB |
| bf16 gradients | 2 | 14 GB |
| fp32 master weights | 4 | 28 GB |
| Adam states $m$ and $v$ (fp32) | 8 | 56 GB |
| **Total** | **16** | **about 112 GB** |

If everything including Adam states is kept in pure bf16: $2+2+2+2=8$ bytes/param, about **56 GB**. Either way it does **not fit on one 24 or 40 GB GPU**; you need an 80 GB card plus tricks (8-bit Adam, ZeRO/FSDP sharding, offload) or multiple GPUs. **Activations are extra** (depend on batch size, sequence length; gradient checkpointing trades compute for memory).

**LoRA (r=16 on all linear layers)**

- Frozen bf16 base: 14 GB (no gradients or optimizer states for it).
- Trainable parameters about 40M: fp32 weights 0.16 GB + grads 0.16 GB + Adam 0.32 GB, about **0.64 GB**.
- **Total about 15 GB + activations** (so roughly 18 to 24 GB with gradient checkpointing and moderate batch): fits a **24 GB GPU**.

**QLoRA**

- 4-bit base: $7\times10^9\times0.5$ bytes = **3.5 GB** (about 4 GB with quantisation constants).
- Adapters + optimizer: about 0.6 GB.
- **Total about 5 GB + activations**, typically **6 to 12 GB in practice**: fits 12 to 16 GB consumer GPUs.

```python
N = 7e9
full_mixed = N * 16 / 1e9                  # 112 GB
lora = N * 2 / 1e9 + 40e6 * 16 / 1e9       # 14 + 0.64 = 14.64 GB
qlora = N * 0.5 / 1e9 + 40e6 * 16 / 1e9    # 3.5 + 0.64 = 4.14 GB (+ constants, activations)
print(full_mixed, lora, qlora)
```

**Activation memory** grows with batch x sequence length x layers; use **gradient checkpointing**, smaller micro-batches with accumulation, FlashAttention, and shorter sequences. Rule of thumb: **full FT is about 16 x params in bytes; LoRA is about 2 x params + small; QLoRA is about 0.5 x params + small**.
