**1. Weights** = parameters x bytes per parameter

| Precision | Bytes/param | 70B weights |
|---|---|---|
| BF16/FP16 | 2 | **140 GB** |
| FP8/INT8 | 1 | 70 GB |
| INT4 (AWQ/GPTQ) | 0.5 | ~35 GB (+ scales, ~38 GB) |

**2. KV cache** per token = 2 (K and V) x layers x KV heads x head_dim x bytes. For Llama-3-70B (80 layers, **GQA with 8 KV heads**, head_dim 128, FP16):

$$2 \times 80 \times 8 \times 128 \times 2 = 327{,}680 \text{ bytes} \approx 0.31\text{ MB/token}$$

- One 8k-token sequence ≈ **2.7 GB**; 32 concurrent 8k sequences ≈ **86 GB**.
- Without GQA (64 KV heads, MHA) it would be 8x larger (about 2.6 MB/token). FP8 KV cache halves it.

**3. Activations/workspace:** small during decode (hundreds of MB to a few GB); prefill of long prompts needs more (chunked prefill bounds it). **4. Runtime overhead:** CUDA context, graphs, fragmentation: about 2 to 8 GB, plus keep 5 to 10% headroom.

**Does it fit on one 80 GB GPU?**

- **BF16: no** (140 GB of weights alone).
- **INT8/FP8: 70 GB of weights** leaves about 5 to 8 GB: technically loads but only room for ~15 to 25k tokens of KV; poor concurrency.
- **INT4: ~38 GB** leaves ~35 GB, i.e. roughly 100k tokens of KV total (e.g. ~12 concurrent 8k sequences) on one GPU: workable with some quality cost.

**Typical deployments**

| Setup | Memory | KV room |
|---|---|---|
| 2x H100 80GB (TP=2), FP8 | 160 GB | ~80 GB (~250k tokens) |
| 2x H100, BF16 | 160 GB | ~15 GB (~45k tokens), tight |
| 4x H100, BF16 | 320 GB | ~170 GB |
| 1x H200 141 GB, FP8 | 141 GB | ~65 GB |

```python
def kv_bytes_per_token(layers=80, kv_heads=8, head_dim=128, bytes_=2): return 2*layers*kv_heads*head_dim*bytes_
def fits(gpu_gb, n_gpu, w_gb, tokens, util=0.9):
    return n_gpu*gpu_gb*util >= w_gb + tokens*kv_bytes_per_token()/1e9
```

**Takeaway:** size by `weights + concurrent_tokens x KV/token + overhead`; quantise weights to free KV space, and use paged KV management.
