**Requirements:** OpenAI-compatible API with streaming, many models and LoRA adapters, per-tenant quotas and billing, p95 time-to-first-token (TTFT) and per-token latency targets, high availability, cost efficiency.

**Architecture**

```text
Client -> API gateway (auth, quotas, rate limits, request validation)
   -> Router/scheduler (model + adapter routing, prefix-cache-aware, queue + priorities)
   -> Inference workers (GPU pods): vLLM/TensorRT-LLM/SGLang
        continuous batching - PagedAttention KV cache - prefix caching
        quantisation (fp8/int4) - tensor parallelism - speculative decoding
   -> Streaming responses (SSE)       Metering/billing -> usage store
Control plane: model registry, deployment, autoscaler, observability
```

**Core techniques**

- **Continuous (in-flight) batching:** add/remove requests every decoding step rather than waiting for a whole batch; large throughput gains.
- **PagedAttention:** KV cache in fixed-size blocks, avoiding fragmentation and enabling more concurrent sequences; share blocks for common prefixes.
- **Prefix caching:** reuse KV for repeated system prompts/RAG context; route requests with the same prefix to the same replica.
- **Chunked prefill / prefill-decode disaggregation:** prefill is compute-bound, decode is memory-bandwidth-bound; separate or interleave to protect TTFT and inter-token latency.
- **Parallelism:** tensor parallel across GPUs for large models; expert parallel for MoE; replicas for throughput.
- **Multi-LoRA serving:** one base model plus many adapters hot-swapped per request.
- **Quantisation and speculative decoding** to cut cost/latency.

**Autoscaling:** scale on **queue depth, KV-cache utilisation, TTFT**, not CPU. GPU cold start is slow (loading weights), so keep warm pools, use fast weight loading, and scale predictively.

**Multi-tenancy:** token-based rate limits (tokens/minute), priority classes, noisy-neighbour isolation, max context/output limits, request timeouts and cancellation on client disconnect.

**Reliability:** health checks, graceful drain, retries to another replica for failed pre-first-token requests, multi-zone replicas, canary rollouts of models/engines.

**Observability and cost:** TTFT, tokens/s, queue time, GPU utilisation, KV usage, error rates, cost per million tokens; evaluate quality regressions when quantising or upgrading the engine.
