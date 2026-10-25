**Problem:** each model needs weights + KV cache + workspace; GPUs are large and costly, but many models/tenants have low or bursty traffic.

**Strategies**

| Strategy | How it works | Trade-off |
|---|---|---|
| **Quantise and right-size** | FP8/INT4 weights, smaller models | Frees memory; quality check |
| **Co-locate several models on one GPU** | Separate processes or one server with a memory budget per model (`gpu_memory_utilization` in vLLM per instance, e.g. 0.3 each) | Contention for bandwidth/compute; reserve KV for each |
| **NVIDIA MIG** | Hardware partitions (A100/H100 up to 7 instances) with isolated memory and SMs | Strong isolation, fixed slice sizes |
| **MPS / time-slicing** | Share GPU across processes (MPS concurrent, time-slicing sequential) | Weaker isolation; no memory protection with time-slicing |
| **LoRA multiplexing** | One base model in memory, many **adapters** loaded per request (vLLM `--enable-lora`, S-LoRA, LoRAX, Punica kernels batch different adapters together) | Cheap multi-tenant fine-tunes; adapter swap and rank limits |
| **Dynamic load/unload (swapping)** | Keep hot models resident, load others on demand from host RAM/NVMe; LRU eviction (Triton model control, Ray Serve multiplexing, KServe ModelMesh, Ollama keep_alive) | Cold-start latency on misses |
| **Weight offload** | Layers/KV in CPU RAM or NVMe, streamed to GPU (FlexGen, vLLM CPU KV offload) | Throughput-oriented, slower latency |
| **Model-aware scheduling/bin-packing** | Place models by memory footprint, traffic profile and affinity across the fleet; separate pools for large vs small models | Needs a scheduler (Kubernetes + custom, Run:ai) |
| **Shared KV memory pool** | Paged allocation with per-model quotas | Complexity |

**Budget formula (per GPU):** `usable = total x 0.9 - sum(weights_i) - sum(workspace_i)`; remainder is KV cache split by priority/traffic. Reserve headroom to avoid OOM from fragmentation and peak concurrency; set per-model max context and batch limits.

**Operational practice**

- Monitor per-model memory, OOM events, eviction/load rates and latency; alert on fragmentation.
- Pre-warm popular models; keep a small always-on pool for latency-critical ones.
- Isolate noisy tenants (MIG, quotas, rate limits); use priority classes.
- Test worst-case concurrency, not average.
- Prefer **one big shared base + adapters** over many full models when variants come from fine-tuning.
