**Why it fails:** the score matrix is `n x n` per head per layer, and at `n = 64k` that is 4 billion entries per head. Compute is `O(n^2)` too.

**Options**

| Fix | Memory | Compute | Exact? |
|---|---|---|---|
| **Flash Attention** (fused tiled kernel) | O(n) | O(n^2) but fast | Yes |
| **Activation checkpointing** | Lower activations | +33% compute | Yes |
| **Sliding-window / local attention** (+ global tokens) | O(n w) | O(n w) | No (restricted) |
| **Sparse patterns** (BigBird, Longformer) | O(n) | O(n) | No |
| **Linear / low-rank attention**, state-space models | O(n) | O(n) | No |
| **Sequence / context parallelism** (Ring Attention) | Split across GPUs | Same total | Yes |
| **Chunk the input** + retrieval or hierarchical summarisation | Bounded | Bounded | N/A |
| **GQA + KV quantisation** (inference) | Smaller cache | Less bandwidth | Mostly |

**Typical recipe:** turn on Flash Attention first (often enough), add gradient checkpointing and BF16, then use sequence parallelism or a sliding-window architecture if still too long. If most queries only need a few passages, use RAG instead of a longer context.

```python
model = AutoModelForCausalLM.from_pretrained(name, torch_dtype=torch.bfloat16,
                                             attn_implementation="flash_attention_2")
model.gradient_checkpointing_enable()
```

**Remember:** longer context also needs position handling that extrapolates (RoPE scaling) and quality checks on long-range recall.
