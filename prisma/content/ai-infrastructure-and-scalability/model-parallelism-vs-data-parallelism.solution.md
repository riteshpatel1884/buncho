**Data parallelism (DP):** every GPU holds a **full model copy** and processes a **different slice of the batch**. After backward, gradients are **all-reduced** (averaged) so replicas stay identical.

- Pros: simple, scales throughput. Cons: model, gradients and optimiser state must fit on each GPU (**memory redundancy**); communication of gradients each step.
- Implementations: PyTorch **DDP** (bucketed gradient all-reduce overlapped with backward), **FSDP/ZeRO** (shard states to remove redundancy).

**Model parallelism:** split the **model** across devices because it does not fit or to speed up layers.

| Type | What is split | Communication |
|---|---|---|
| **Tensor (intra-layer)** | Weight matrices (columns/rows of attention and MLP) | All-reduce per layer (needs NVLink) |
| **Pipeline (inter-layer)** | Groups of layers (stages) | Point-to-point activations between stages; micro-batches to limit bubbles |
| **Sequence/context parallel** | Sequence dimension (long contexts) | Attention exchange (ring attention) |
| **Expert parallel (MoE)** | Different experts on different GPUs | All-to-all token routing |

**Choosing**

- Model fits on one GPU → **DP** (or FSDP for memory efficiency).
- Doesn't fit → FSDP/ZeRO-3 or **tensor + pipeline** parallelism.
- Frontier-scale training → **3D/4D parallelism**: tensor parallel inside a node (NVLink), pipeline parallel across nodes, data parallel across replicas (+ expert/sequence parallel). Megatron-LM, DeepSpeed, NeMo, torchtitan.

**Rules of thumb:** keep the highest-bandwidth communication (TP) within a node, minimise pipeline bubbles with enough micro-batches, use activation checkpointing and mixed precision, and overlap communication with compute. For **inference**, data parallelism = more replicas (throughput), model parallelism = fit/latency.

```python
# DDP skeleton
model = torch.nn.parallel.DistributedDataParallel(model.cuda(), device_ids=[local_rank])
sampler = torch.utils.data.distributed.DistributedSampler(dataset)   # each rank sees a different shard
```
