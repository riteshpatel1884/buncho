| | MHA | MQA | GQA |
|---|---|---|---|
| Query heads | H | H | H |
| K/V heads | H | **1** | **G** (1 < G < H) |
| Each K/V head is shared by | 1 query head | all query heads | H/G query heads |
| KV cache size | 1x | 1/H | G/H |
| Quality | Best | Slight drop | Close to MHA |

**Why:** during autoregressive decoding the bottleneck is reading the KV cache from memory. Fewer K/V heads shrink the cache and the bandwidth per token, so you can serve longer contexts and bigger batches. Query heads stay numerous, so most of the model's expressiveness is kept.

```python
# q: [B, H, T, d]   k, v: [B, G, T, d]
rep = H // G
k = k.repeat_interleave(rep, dim=1)      # broadcast each K/V head to its group of queries
v = v.repeat_interleave(rep, dim=1)
out = torch.softmax(q @ k.transpose(-1, -2) / d ** 0.5, dim=-1) @ v
```

**Example:** 64 query heads with 8 K/V heads gives an 8x smaller cache than MHA. Llama 2 70B, Llama 3 and Mistral use GQA.

**Converting a model:** an existing MHA checkpoint can be "uptrained" to GQA by mean-pooling K/V heads in each group and training briefly.
