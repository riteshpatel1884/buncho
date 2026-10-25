**Problem with DDP:** every GPU holds a full copy of **parameters, gradients and optimiser states**. For mixed-precision Adam that is about **16 bytes/param** (2 fp16 params + 2 fp16 grads + 12 for fp32 master weights, momentum, variance), so 7B ≈ 112 GB before activations.

**ZeRO (Zero Redundancy Optimizer, DeepSpeed)** removes this redundancy by **sharding model states across the $N$ data-parallel GPUs**:

| Stage | Sharded | Memory per GPU (Ψ params) |
|---|---|---|
| ZeRO-1 | Optimiser states | 4Ψ + 12Ψ/N |
| ZeRO-2 | + Gradients | 2Ψ + (2Ψ + 12Ψ)/N |
| **ZeRO-3** | + Parameters | **16Ψ/N** |

ZeRO-Offload/ZeRO-Infinity add CPU RAM and NVMe offload.

**FSDP (PyTorch Fully Sharded Data Parallel)** is PyTorch's native implementation of the **ZeRO-3** idea (also `SHARD_GRAD_OP` ≈ ZeRO-2, `NO_SHARD` = DDP, `HYBRID_SHARD` = shard within node, replicate across nodes). Per FSDP unit (e.g. a Transformer block):

1. **All-gather** the full parameters of that unit just before its forward (and again before backward).
2. Compute, then **free** the gathered parameters.
3. After backward, **reduce-scatter** gradients so each rank keeps only its shard, and the optimiser updates its own shard.

```python
from torch.distributed.fsdp import fully_shard          # FSDP2 (per-parameter sharding, DTensor)
for block in model.layers: fully_shard(block)           # wrap per block to limit peak memory
fully_shard(model)
```

Communication cost ≈ 1.5x DDP's (all-gather twice + reduce-scatter vs one all-reduce), overlapped with compute via prefetching; works best with fast interconnects and wrapping at block granularity.

**Differences**

| | **FSDP** | **DeepSpeed ZeRO** |
|---|---|---|
| Origin | PyTorch core (Meta) | Microsoft library/engine |
| Integration | Native `torch.distributed`, composable with `torch.compile`, DTensor, tensor/pipeline parallel (torchtitan) | Config-driven (JSON), own engine and optimisers (fused Adam, 1-bit Adam), Hugging Face Trainer/Accelerate integration |
| Offload | CPU offload (params/grads) | **Richer**: ZeRO-Offload and ZeRO-Infinity (CPU + NVMe) |
| Stages | Sharding strategies equivalent to ZeRO-1/2/3, hybrid | Stage 1/2/3 explicit, plus MiCS/ZeRO++ (quantised comms, hierarchical partitioning) |
| Extras | Mixed precision policy, activation checkpointing wrappers | Pipeline engine, MoE, sparse attention, inference engine |

**Choosing:** FSDP2 for PyTorch-native stacks and composability; DeepSpeed when you need NVMe offload, ZeRO++ or its ecosystem. Both reach similar memory savings; tune wrap policy, activation checkpointing, bf16, and overlap, and combine with tensor/pipeline parallelism at scale.
