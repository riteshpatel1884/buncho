**Role:** distribute requests across model replicas/GPUs to maximise utilisation, minimise latency, provide availability, and enable rolling updates.

**Why classic round-robin or least-connections falls short for LLMs**

- Request cost varies by **orders of magnitude** (prompt length x output length): one long generation can occupy a replica for a minute.
- **State matters:** each replica has a **KV/prefix cache**; sending a request to a replica that already holds its prefix skips prefill.
- Replicas have different capacity (GPU types, TP configs), warm-up state, and queues.
- Responses are **long-lived streams** (SSE/WebSocket), so connection-based balancing and timeouts must fit.

**Strategies**

| Strategy | Notes |
|---|---|
| **Least outstanding load** | Route by in-flight requests/tokens, queue length, or KV-cache usage reported by replicas (power-of-two-choices to avoid herding) |
| **Prefix-/cache-aware routing** | Consistent hashing on conversation id or prompt prefix, or radix-tree prefix matching (SGLang router, llm-d, vLLM production-stack, Envoy AI Gateway) to hit warm KV cache, with load override to avoid hotspots |
| **Session affinity** | For multi-turn chats and agents with growing context |
| **Weighted routing** | Different GPU generations or model versions; canary/blue-green rollouts |
| **Model/pool routing** | By model name, tenant, priority, or LoRA adapter present on the replica |
| **Prefill/decode aware** | Route prefill to compute-optimised pool and decode to bandwidth pool (disaggregated serving) |
| **Geo/latency routing** | Nearest healthy region, data-residency constraints, failover to another region or API provider |

**Operational requirements**

- **Health checks:** readiness only after weights loaded and warm; liveness detecting hung GPUs; **drain gracefully** (finish streams) before termination.
- **Retries/timeouts:** retry only idempotent or not-yet-started requests; avoid retry storms; hedging for tail latency with care (doubles cost).
- **Backpressure:** admission control, rate limits per tenant, queue limits, 429/503 with retry-after; priorities.
- **Observability:** per-replica TTFT/TPOT, queue depth, cache hit rate, error rates.
- **Layers:** L7 gateway/AI gateway (auth, quotas, routing, fallbacks) in front of an inference-aware router in front of model servers; Kubernetes Gateway API Inference Extension supports this pattern.

**Outcome:** better p95/p99 latency, higher cache hit rates (fewer prefill FLOPs), balanced GPU usage, and safe deployments.
