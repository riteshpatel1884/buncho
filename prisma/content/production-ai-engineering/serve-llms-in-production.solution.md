**Step 1: choose the hosting model**

| Option | Pros | Cons |
|---|---|---|
| **Managed API** (OpenAI, Anthropic, Gemini, Bedrock) | No GPU ops, best models, pay per token | Cost at scale, data governance, rate limits, provider changes |
| **Managed open-model hosting** (Together, Fireworks, Bedrock, Azure) | Open weights, less ops | Less control |
| **Self-hosted** (vLLM, SGLang, TensorRT-LLM on Kubernetes) | Control, privacy, predictable cost at high utilisation, custom models/adapters | Ops burden, GPU capacity, tuning |

**Step 2: serving stack (self-hosted)**

```text
Client -> API gateway (auth, rate limits, routing) -> Load balancer
   -> Inference engine replicas: continuous batching, paged KV cache, prefix caching,
      quantisation (FP8/INT4), tensor parallelism, speculative decoding, streaming
   -> Observability (TTFT, ITL, tokens/s, queue depth, KV use, errors) + autoscaler
```

**Key practices**

- **Use a purpose-built engine** (vLLM, SGLang, TensorRT-LLM), not naive `transformers.generate`; they raise throughput several-fold via batching and memory management.
- **Right-size the model and precision:** smallest model that meets quality; quantise (FP8 or 4-bit) and verify quality on your evals.
- **Capacity planning** from GPU memory (weights + KV cache) and measured tokens/s at your SLOs; autoscale on queue depth and KV utilisation; keep warm replicas since loading weights takes minutes.
- **Stream** responses; set max output tokens, timeouts, request cancellation on disconnect.
- **Reliability:** health checks, graceful drain, multi-zone replicas, canary rollouts, fallbacks to another model or provider.
- **Multi-tenancy:** per-tenant quotas, priority classes, LoRA adapters served on one base.
- **Security:** network isolation, secrets management, input/output guardrails, model artefact integrity.
- **Cost control:** caching (prefix, semantic), routing easy requests to small models, batch APIs for offline work, spot/reserved capacity mix.

**Decision rule:** start with APIs for speed; move to self-hosting when volume, latency, privacy or customisation justify the operational cost, often hybrid with an API fallback.
