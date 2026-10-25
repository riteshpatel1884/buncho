**Why it is hard:** models differ in behaviour, formatting, tool-calling schema, context limits, safety refusals, latency, pricing and rate limits, so a "drop-in" swap can silently change quality.

**Prepare (before any traffic moves)**

1. **Abstraction layer:** an internal gateway/client interface with provider adapters (OpenAI-compatible API, LiteLLM-style); no provider-specific calls scattered through the codebase.
2. **Evaluation suite:** golden dataset + judges covering accuracy, format, tool calls, safety, latency, cost, plus real traffic samples.
3. **Prompt portability:** expect to **re-tune prompts** per model (system-prompt style, XML vs JSON, few-shot count); keep per-model prompt variants under version control.
4. **Capability check:** context length, structured output/tool calling, streaming, vision, rate limits, data residency and privacy terms.

**Migrate gradually**

```text
Offline eval (new vs old) -> shadow traffic (new model runs silently, outputs compared, not shown)
   -> canary 1-5% -> A/B with guardrail metrics -> 25% -> 50% -> 100%
   -> keep old path as automatic fallback for a stabilisation period -> retire
```

- **Dual-run / shadow:** compare outputs with LLM-judge and metrics; inspect disagreements.
- **Traffic control:** feature flags/weights in the gateway; per-tenant or per-use-case migration order (low-risk first).
- **Automated rollback** on quality, error, latency or cost thresholds.

**Stateful dependencies:** embeddings (a different embedding model means a new index: build in parallel and cut over), fine-tuned models (retrain/adapt on the new base), stored conversation formats, cached responses (include the model in cache keys).

**Operational details:** pre-warm capacity and quotas on the new provider, check rate limits and regional availability, update monitoring dashboards, contract/privacy review, communicate to stakeholders, and monitor cost per request after cutover.

**Provider deprecations:** track end-of-life dates, pin versions, schedule upgrade work, and run the scheduled eval suite to detect silent behaviour changes in "latest" aliases.

**Multi-provider architecture** (active-active or primary + fallback) turns future migrations into configuration changes.
