**Why a gateway:** central control of keys, cost, security and reliability across many apps and providers, instead of each team integrating and securing providers on its own.

**Architecture**

```text
App/Service -> AI Gateway (OpenAI-compatible API)
   1. AuthN/AuthZ (service identity, team, project; model access policy)
   2. Request guardrails (PII redaction, prompt-injection/DLP checks, size limits)
   3. Quota and rate limiting (requests/min + tokens/min, per key/team/model)
   4. Budget check (per-team monthly cap, soft alerts, hard stop)
   5. Cache lookup (exact/semantic/prompt cache where allowed)
   6. Router (model aliases, cost/latency/quality policies, A/B, region residency)
   7. Provider adapters (OpenAI, Anthropic, Google, Azure, self-hosted) with retries, timeouts, fallbacks
   8. Response guardrails, streaming passthrough
   9. Metering (tokens, cost, latency, user/team tags) -> usage store -> billing/chargeback, dashboards, alerts
```

**Rate limiting and cost control**

- **Dual limits:** requests per minute and **tokens per minute** (cost scales with tokens). Use token buckets in Redis (atomic Lua) for distributed enforcement; estimate tokens before the call (input + max_tokens), reconcile with actual usage afterwards.
- **Quotas/budgets** per team and project, with alerts at thresholds and hard caps; per-user limits to contain abuse.
- **Cost levers:** model routing (cheap model for simple tasks), caching, max_tokens defaults, prompt compression, batch APIs for offline work, provider price-aware routing.
- **Priority classes:** production traffic over experiments; queue or shed low-priority requests when upstream limits (429) are hit.
- **Showback/chargeback** using tags (team, feature, environment).

**Reliability:** retries with backoff and jitter on 429/5xx, timeouts, **circuit breakers** per provider/model, **fallback chains**, health checks, multi-key/multi-region provider pooling.

**Security and governance:** central secret management (apps never see provider keys), audit logs, data-residency rules, approved-model allowlist, prompt/response logging with redaction and retention policy.

**Build vs buy:** LiteLLM, Portkey, Kong/Envoy AI gateway, cloud gateways (Azure APIM, Cloudflare AI Gateway) cover much of this; build custom for specific compliance or routing logic.

**Metrics:** gateway overhead (target a few ms), error and fallback rates, cache hit rate, spend per team, 429 rate, p95 latency per provider.
