**Tensor parallelism (TP)** splits **individual layers' weight matrices** across GPUs so each GPU computes a slice of every layer, in parallel.

**Megatron-LM scheme for a Transformer block**

- **MLP:** first linear $Y = XA$ is split **column-wise** ($A=[A_1, A_2]$); each GPU computes $\text{GeLU}(XA_i)$ independently (no communication). The second linear is split **row-wise**, producing partial sums, combined with one **all-reduce**.
- **Attention:** heads are divided across GPUs (each GPU owns a subset of heads and their Q/K/V and KV cache); the output projection is row-parallel followed by one **all-reduce**.
- So each block needs about **2 all-reduces** in the forward pass.

```python
# conceptual: column-parallel then row-parallel linear
h_local = gelu(x @ A_cols[rank])              # no comm
y_partial = h_local @ B_rows[rank]
y = all_reduce(y_partial)                     # sum partials across GPUs
```

**Benefits for serving**

1. **Fit:** a 140 GB BF16 model runs on TP=2 or 4 of 80 GB GPUs, and the KV cache is sharded too.
2. **Latency:** decode is memory-bandwidth-bound; TP aggregates bandwidth of N GPUs, reducing per-token time (roughly 1/N minus communication).
3. **More KV room** per replica, enabling larger batches.

**Costs and limits**

- **Communication per layer** on the critical path; needs high-bandwidth **NVLink/NVSwitch**. Over PCIe or across nodes, TP degrades sharply, so keep TP within a node (typically 2 to 8).
- Efficiency drops as N grows (smaller matmuls per GPU, all-reduce latency dominates in decode), and GQA models with few KV heads limit TP degree (KV heads must divide evenly or get replicated).
- All GPUs idle together if one is slow; fault in one GPU takes down the replica.

**Practice (vLLM):** `--tensor-parallel-size 4`. Use the smallest TP that fits the model with adequate KV space, then scale **replicas** (data parallel) for throughput; combine with pipeline parallelism for multi-node models. Consider FP8/INT4 to reduce the required TP.
