**Step 1: characterise the workload**

- Requests per second (average and **peak**), growth forecast.
- Input and output token distributions (p50/p95), concurrency, streaming behaviour.
- SLOs: TTFT, inter-token latency, availability.
- Prefix-sharing and cache hit rates, model mix, traffic seasonality, batch vs interactive split.

**Step 2: model memory per GPU**

- **Weights:** parameters x bytes (7B bf16 = 14 GB; 70B bf16 = 140 GB, so a multi-GPU tensor-parallel group; 4-bit roughly a quarter).
- **KV cache per token** $=2\times\text{layers}\times\text{kv\_heads}\times d_{head}\times\text{bytes}$; multiply by concurrent tokens in flight.
- Activations and engine overhead (about 10 to 20%).
- Remaining memory after weights = KV budget, which limits **concurrent sequences**.

**Step 3: throughput**

- **Prefill** is compute-bound (tokens/s per GPU), **decode** is memory-bandwidth-bound (tokens/s grows with batch size until saturation).
- Benchmark your actual model/engine/GPU on **realistic traffic** (e.g. vLLM benchmarks) to get tokens/s at the SLO, rather than trusting peak specs.

**Worked example (illustrative)**

- 50 req/s peak, average 1,500 input + 300 output tokens.
- Output demand: 50 x 300 = 15,000 tokens/s; input demand: 75,000 prefill tokens/s.
- If benchmarking shows one GPU sustains about 2,500 output tokens/s within the latency SLO at this mix, you need about 15,000 / 2,500 = 6 GPUs for decode at peak, **plus** prefill capacity checks and headroom.
- Add **30 to 50% headroom** for bursts, N+1/N+2 redundancy across zones, and rolling deployments: about 10 to 12 GPUs.

**Step 4: scale and cost**

- Autoscale on queue depth/KV utilisation; warm pools because model loading takes minutes.
- Cost per 1M tokens = (GPU hourly cost x GPUs) / (tokens per hour at target utilisation). Compare with API pricing to decide **self-host vs API**; reserved/spot mixes; batch queues for offline loads.
- Non-GPU components: vector DB size (vectors x dims x bytes + index overhead), network egress, storage, retrieval QPS.

**Step 5: validate and iterate:** load tests (including long-context and burst scenarios), measure p95/p99, plan for failure of a node/zone, track utilisation and revisit forecasts monthly. Optimise before buying: quantisation, caching, smaller models, shorter prompts, and routing often cut capacity needs by large factors.
