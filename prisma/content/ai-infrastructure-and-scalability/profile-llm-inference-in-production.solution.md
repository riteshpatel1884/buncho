**Three layers of signals**

| Layer | Metrics |
|---|---|
| **User/request** | TTFT, TPOT/inter-token latency, end-to-end latency (p50/p95/p99), queue wait, input/output tokens, error/timeout/429 rates, cancellations, SLO attainment/goodput, cost per request |
| **Engine/scheduler** | Running vs waiting requests, batch size, **KV-cache utilisation**, prefix-cache hit rate, preemption/swap counts, tokens per step, prefill vs decode time, speculative acceptance rate, token throughput |
| **Hardware** | GPU utilisation and **SM occupancy/tensor-core activity**, **memory bandwidth utilisation**, memory used, power, temperature/clock throttling, **NVLink/PCIe traffic**, ECC/XID errors (DCGM exporter), CPU, network |

**Tooling:** engines expose Prometheus metrics (vLLM, SGLang, TGI, Triton: `/metrics`) → Prometheus/Grafana; **NVIDIA DCGM exporter**; OpenTelemetry traces per request (gateway → router → engine, with spans for queue, prefill, decode); structured logs with request ids; LLM observability (Langfuse, Phoenix, Datadog) tying to prompt/version.

**Alerts:** TTFT/TPOT p95 above SLO, queue depth rising for N minutes, KV-cache above 90% with preemptions, error rate, GPU XID errors/throttling, cache-hit drop, abnormal output length, cost spikes. Alert on **symptoms (SLO burn)** first, causes second.

**Reading the signals**

- High TTFT + high queue + low GPU util → scheduler/CPU or batching limits; high TTFT + high util → add capacity or chunked prefill.
- TPOT up with batch size → decode is bandwidth/KV bound; high KV usage + preemptions → memory limits (reduce max context, quantise KV, add GPUs).
- "100% GPU util" is misleading; check tensor-core activity and memory-bandwidth utilisation.
- Tail latency spikes → long prompts blocking decode, noisy neighbours, GC pauses, network, thermal throttling.

**Profiling tools:** `torch.profiler` / Nsight Systems (timeline: kernels, gaps, CPU launch overhead, NCCL), Nsight Compute (kernel-level roofline), `nvidia-smi dmon`, py-spy for the CPU side, vLLM profiler endpoints, flame graphs. Look for **GPU idle gaps** (CPU-bound scheduling, Python overhead, tokenisation), small kernels (fuse, CUDA graphs), and communication stalls (NCCL all-reduce).

**Process:** baseline with load tests, dashboards per model/version, canary deploys comparing metrics, capacity model (max RPS at SLO), regular regression benchmarks on each engine/driver/model change, and incident runbooks.
