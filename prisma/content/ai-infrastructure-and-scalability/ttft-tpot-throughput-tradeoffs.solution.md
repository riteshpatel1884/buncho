**Definitions**

- **TTFT (time to first token):** request arrival → first output token = queueing + (network) + **prefill** time. Perceived responsiveness; grows with prompt length and load.
- **TPOT / ITL (time per output token / inter-token latency):** average time between subsequent tokens during **decode**. Determines streaming speed (e.g. 25 ms TPOT = 40 tok/s per user).
- **End-to-end latency** = TTFT + (output_tokens − 1) × TPOT.
- **Throughput:** total tokens/s (or requests/s) the system produces across all users. Also **goodput** = throughput of requests that **meet SLOs**.

**Trade-offs**

| Action | TTFT | TPOT | Throughput |
|---|---|---|---|
| Larger batch / more concurrent sequences | Higher (queueing, bigger prefill steps) | **Higher** (more KV and compute per step) | **Higher** (amortised weight reads) |
| Long prompts arriving | Higher for them | Spikes for others if prefill blocks decode | Lower while stalled |
| **Chunked prefill** | Slightly higher for the long prompt | Smoother (bounded stalls) | Similar/higher |
| **Prefill-decode disaggregation** | Better, isolated | Better, isolated | Higher goodput, more infra |
| Quantisation, faster GPU | Lower | Lower | Higher |
| Speculative decoding | Neutral | **Lower** | Lower at high batch (wasted compute) |
| Prefix caching | **Much lower** | Neutral | Higher |
| TP across more GPUs | Lower | Lower | Lower per GPU (communication) |

**Why:** decode is memory-bound, so batching is almost free until the batch becomes compute-bound or KV memory runs out; beyond that, each extra sequence slows every step. A throughput-optimal batch size usually **violates latency SLOs**, so you pick the largest batch that still meets TTFT p95 and TPOT p95.

**SLO examples:** chat: TTFT under 500 ms to 1 s, TPOT under 50 ms (above human reading speed ~ 20 tok/s); code completion: TTFT under 200 ms; batch/offline: throughput only.

**Measure** under realistic load with a load generator (prompt/output length distributions, Poisson arrivals): plot throughput vs p95 latency curves (the "knee"), report percentiles not means (genai-perf, vLLM benchmark_serving, LLMPerf), and track **goodput at SLO** and cost per million tokens.
