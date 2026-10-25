**Setup (H100 SXM):** HBM bandwidth ≈ **3.35 TB/s**, BF16 dense compute ≈ **989 TFLOP/s**. A 70B model has 70e9 parameters.

**Batch-1 decode is memory-bound.** Each generated token must read **all weights once** (plus KV cache):

$$\text{tokens/s} \le \frac{\text{bandwidth}}{\text{bytes read per token}}$$

| Precision | Weight bytes | Upper bound (1 GPU bandwidth) |
|---|---|---|
| BF16 | 140 GB | 3.35e12 / 140e9 ≈ **24 tok/s** (but 140 GB does not fit in 80 GB) |
| FP8/INT8 | 70 GB | ≈ **48 tok/s** |
| INT4 | 35 GB | ≈ **96 tok/s** |

Reality is **60 to 80% of the bound** (kernel efficiency, KV reads, attention, launch overhead), so about 30 to 40 tok/s for FP8 and 60 to 70 for INT4. With **TP=2** on two H100s in BF16 the aggregate bandwidth doubles (about 48 tok/s bound) minus all-reduce overhead (NVLink).

**Compute check:** FLOPs per token ≈ 2 x 70e9 = 140 GFLOP, so the compute bound is 989e12 / 140e9 ≈ **7,000 tok/s**, about 300 times higher than the memory bound, confirming batch 1 is badly **memory-bound** (arithmetic intensity ≈ 1 FLOP/byte versus the ridge point ≈ 295 FLOP/byte).

**Effect of batching:** weights are read once per step for the whole batch, so intensity grows ≈ linearly with batch size B (BF16: B FLOP/byte). Throughput scales almost linearly until **B ≈ 100 to 300**, then compute-bound; but KV-cache reads grow with B x context and memory capacity limits B. This is why **continuous batching** multiplies throughput (thousands of tok/s aggregate) while per-user speed stays about the same or drops.

**Ways to beat the bound for a single stream:** quantisation (fewer bytes), **speculative decoding** (verify k tokens per weight read), tensor parallelism (more aggregate bandwidth), MoE (read only active experts), faster memory (H200 4.8 TB/s, B200 ~8 TB/s, SRAM chips).

```python
def max_tok_s(bw_tbs, params_b, bytes_per_param, eff=0.7): return eff * bw_tbs*1e12 / (params_b*1e9*bytes_per_param)
print(max_tok_s(3.35, 70, 1))   # FP8 on H100: ~33 tok/s
```
