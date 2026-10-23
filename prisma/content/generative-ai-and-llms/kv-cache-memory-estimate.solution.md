**Formula**

`bytes_per_token = 2 (K and V) x layers x kv_heads x head_dim x bytes_per_value`

```python
def kv_bytes_per_token(layers, kv_heads, head_dim, bytes_=2):
    return 2 * layers * kv_heads * head_dim * bytes_

per_tok = kv_bytes_per_token(80, 8, 128, 2)   # 327,680 B = 320 KiB
per_seq = per_tok * 32_768                    # 10.0 GiB for one 32k request
```

**Batch constraint:** if weights use about 40 GB (for example a quantised 70B model) and 80 GB is available, about 35 GB remains for cache after overhead, so only about 3 concurrent 32k requests fit. Without GQA (64 KV heads instead of 8) the cache would be 8x larger and a single 32k request would not leave room to batch at all.

**Ways to reduce it**

| Technique | Effect |
|---|---|
| GQA / MQA | Fewer KV heads (8x here) |
| Quantise KV to FP8/INT8/INT4 | 2 to 4x |
| Sliding-window attention | Cap tokens kept per layer |
| Eviction (attention sinks, heavy-hitter methods) | Keep only important tokens |
| Low-rank / latent compression (e.g. MLA) | Store a compressed latent instead of full K/V |
| PagedAttention | No fragmentation or over-reservation |
| Prefix caching | Share the cache of a common prompt across requests |
| Shorter prompts and retrieval instead of stuffing context | Fewer tokens |

**Trade-off:** more aggressive compression raises throughput but can hurt long-range recall, so re-run quality evals on long-context tasks after every change.
