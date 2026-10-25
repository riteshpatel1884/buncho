**Model sharding** = partitioning a model's **parameters (and possibly gradients, optimiser states, KV cache, activations)** across multiple devices so each holds only a fraction, instead of replicating everything.

**Forms**

| Form | What is sharded | Typical use |
|---|---|---|
| **Tensor sharding** (tensor parallelism) | Each weight matrix split across GPUs | Serving and training large layers, within a node |
| **Layer/pipeline sharding** | Contiguous groups of layers per device | Multi-node models |
| **Parameter/optimiser sharding (ZeRO, FSDP)** | Params, gradients, optimiser states, gathered on demand per layer | Training with data parallelism; removes replica redundancy |
| **Expert sharding** | MoE experts distributed across devices | MoE models (all-to-all) |
| **KV-cache/sequence sharding** | Sequence dimension (ring attention, context parallel) | Very long contexts |
| **Embedding/table sharding** | Large embedding tables across hosts | Recommenders |
| **Checkpoint sharding** | Weights stored as multiple safetensors files for fast parallel load | Loading efficiency |

**When to use**

- The model (or training state) **does not fit** on one device: e.g. 70B BF16 inference needs 140 GB; training 7B with Adam needs about 112 GB (16 bytes/param).
- To **cut latency** via aggregated memory bandwidth (TP for decode).
- To **increase KV capacity** and batch size.
- To train larger models/batches with limited per-GPU memory (FSDP).

**When not to:** if the model fits comfortably, prefer **replicas (data parallel)**; sharding adds communication (all-reduce/all-gather), synchronisation, failure coupling and operational complexity. Also consider quantisation first (fit on fewer GPUs).

**Rules:** shard within NVLink domains first, use as few shards as needed, balance load across shards, and combine strategies (e.g. TP=8 in-node, PP=2 across nodes, DP replicas for throughput).

```python
# Hugging Face: shard automatically across available GPUs
model = AutoModelForCausalLM.from_pretrained(name, device_map="auto", torch_dtype=torch.bfloat16)
```
