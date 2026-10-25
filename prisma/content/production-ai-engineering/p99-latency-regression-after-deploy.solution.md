**1. Triage and contain:** confirm the regression is real and tied to the release (deploy markers on dashboards); if user impact is severe, **roll back or flag off** first, then investigate. Check whether p50 moved too (systemic) or only the tail (queues, outliers).

**2. Narrow it down with traces:** break latency into spans: gateway, auth, guardrails, retrieval, rerank, prompt build, queue wait, **TTFT**, decode time per token, post-processing, tool calls. Compare traces before and after; slice by prompt length, tenant, model, endpoint and region.

**3. Likely causes in a "no model change" deploy**

| Area | Examples |
|---|---|
| **Prompt/context changes** | Longer system prompt, more retrieved chunks, bigger history, new tool schemas, so **more input tokens** (prefill time, KV memory); loss of **prefix caching** because dynamic text moved to the top or a timestamp was added to the prefix |
| **Output length** | Prompt change makes answers longer, `max_tokens` raised, reasoning/"thinking" enabled |
| **Inference config** | Changed batch limits (`max_num_seqs`, `max_num_batched_tokens`), chunked prefill, quantisation, parallelism, GPU memory utilisation, engine/driver/CUDA version upgrade, autoscaler thresholds |
| **Application code** | Added synchronous or sequential calls (guardrail, rerank, logging), N+1 calls, lost parallelism, blocking calls in async code, bigger serialisation, new middleware |
| **Dependencies** | Vector DB index change (HNSW params, filters), cold cache, DB connection pool limits, new network hops/regions, TLS or DNS changes |
| **Resources** | Pod CPU/memory limits too low (throttling, GC pauses), fewer replicas, noisy neighbours, cold starts, node type change |
| **Retries and timeouts** | New retry policy multiplying load, tighter timeouts triggering retries |
| **Observability overhead** | Synchronous tracing/logging exporter blocking requests |

**4. Confirm with experiments:** replay production traffic against old and new versions in staging (A/B on identical requests), diff configs and prompts between releases, profile the service (flame graphs, async profiling), check GPU metrics (queue depth, KV cache usage, preemptions), compare token counts per request.

**5. Fix and prevent:** restore parallelism/caching, trim prompts, correct config; add **latency and token-count regression checks to CI/canary** (automatic rollback if p99 or tokens/request exceed thresholds), keep release notes of prompt/config changes, and track cache hit rate as an SLI.

**Rule of thumb:** with the model fixed, tail latency is mostly **tokens in, tokens out, queueing, cache misses and sequential dependencies**; check those first.
