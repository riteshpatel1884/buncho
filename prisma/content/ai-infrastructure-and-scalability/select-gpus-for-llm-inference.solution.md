**Selection criteria (in order)**

1. **Memory capacity:** weights + KV cache + activations/overhead must fit (see the 70B estimate). Capacity decides the **number of GPUs** and the batch/context you can serve.
2. **Memory bandwidth:** decode is bandwidth-bound, so tokens/s per request about equals bandwidth / bytes read per token. Often the most important spec for latency.
3. **Compute (FLOPs, precision support):** matters for prefill, large batches, and FP8/FP4 support (Hopper FP8, Blackwell FP4).
4. **Interconnect:** NVLink/NVSwitch for tensor parallelism (hundreds of GB/s); PCIe-only cards make TP across GPUs slow.
5. **Software and cost:** CUDA ecosystem (vLLM, TensorRT-LLM) vs ROCm/TPU/others, availability, price per hour, power.

**Rough landscape (verify current specs/prices)**

| GPU | Memory | Bandwidth | Typical use |
|---|---|---|---|
| T4 / L4 | 16 / 24 GB | 0.3 TB/s | Small models (7B quantised), cheap inference |
| A10G / L40S | 24 / 48 GB | 0.6 to 0.9 TB/s | 7B to 34B quantised, image models |
| A100 | 40 / 80 GB | 1.5 to 2.0 TB/s | Workhorse, 70B on 2 to 4 GPUs |
| **H100 / H200** | 80 / 141 GB | 3.35 / 4.8 TB/s | High throughput, FP8, 70B on 1 to 2 (H200 fits 70B FP8 on one) |
| **B200 / GB200** | 180 to 192 GB | about 8 TB/s | Largest models, FP4, long context |
| AMD MI300X | 192 GB | 5.3 TB/s | Large memory, ROCm |

**Decision process**

```text
model_bytes = params x bytes_per_weight  (BF16=2, FP8/INT8=1, INT4=0.5)
need = model_bytes + kv_per_token x tokens_in_flight + ~10-20% overhead
n_gpus = ceil(need / usable_gpu_memory)      # then check TP efficiency and latency target
```

- **Latency-critical, small batch:** high bandwidth and TP over NVLink.
- **Throughput/batch-heavy:** large memory (more KV, bigger batch), cost per token matters; compare **$/million tokens** from a benchmark, not specs.
- **Small models/edge:** consumer GPUs (RTX 4090/5090) or quantised on CPU/NPU.
- Benchmark your model on candidates with realistic prompt lengths and concurrency; consider cloud vs reserved vs on-prem.
