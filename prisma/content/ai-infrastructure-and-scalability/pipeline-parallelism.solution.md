**Pipeline parallelism (PP)** splits the model **by layers** into consecutive **stages**, each on a different GPU/node. Activations flow stage to stage in the forward pass; gradients flow back in reverse.

**The bubble problem:** with one batch, stage 2 waits for stage 1, etc., so only one GPU is busy at a time. Fix: split the batch into **micro-batches** and stream them through the pipeline so stages overlap.

$$\text{bubble fraction} = \frac{p-1}{m + p - 1}$$

with $p$ stages and $m$ micro-batches. For $p=4$, $m=16$: 3/19 ≈ 16% idle; $m=4$: 3/7 ≈ 43% idle. So use $m \gg p$.

**Schedules**

| Schedule | Idea |
|---|---|
| **GPipe** | All forwards then all backwards; high activation memory |
| **1F1B (PipeDream-Flush)** | Alternate forward/backward after warm-up; lower memory |
| **Interleaved 1F1B** | Each GPU holds several non-contiguous stages: smaller bubble, more communication |
| **Zero-bubble / DualPipe** | Splits backward into input-grad and weight-grad passes to fill bubbles |

**Pros:** communication only between neighbouring stages (small activations, point-to-point), so it works across nodes with modest interconnect; reduces per-GPU memory for parameters.

**Cons:** pipeline bubbles, load balancing between stages (embedding/head layers heavier), complexity (partitioning, schedule), harder with variable-length batches.

**In inference:** PP helps fit very large models across nodes (e.g. 405B across 2 nodes: TP=8 within a node, PP=2 across), and for throughput with many in-flight requests; but it **does not reduce per-token latency** (each token must traverse all stages sequentially), unlike TP. Prefer TP within a node, PP between nodes, replicas for scale.

**Training practice:** combine with TP and DP (3D parallelism), tune micro-batch count, use activation checkpointing; frameworks: Megatron-LM, DeepSpeed, torchtitan, PyTorch `torch.distributed.pipelining`.
