**Failure types to plan for:** provider outage or region failure, rate limiting (429), elevated latency/timeouts, degraded quality (model regression), malformed outputs, dependency failures (vector DB, tools), quota exhaustion.

**Layers of defence**

1. **Timeouts and retries:** per-request timeouts (including time-to-first-token), **bounded retries with exponential backoff and jitter** for transient errors; only retry idempotent operations; **hedged requests** for tail latency when budget allows.
2. **Circuit breakers:** open the circuit after repeated failures to a provider/model, route elsewhere, probe periodically (half-open).
3. **Fallback chain** (ordered by preference):

```text
Primary model (provider A, region 1)
  -> same model via provider B/region 2 (e.g. Azure OpenAI vs OpenAI, Bedrock vs direct)
  -> smaller/cheaper model (same provider)
  -> self-hosted open-weight model
  -> cached or templated response / rules-based answer
  -> graceful message + human handoff or queue for later
```

4. **Load balancing:** spread across keys, deployments and regions; respect provider quotas; weighted routing and health checks.
5. **Request-level resilience:** idempotency keys, request queues for async work, **dead-letter queues**, replay after recovery.
6. **Dependency redundancy:** replicated vector DB, multi-AZ stores, cached retrieval results as fallback.

**Fallback compatibility issues**

- Models differ in prompt format, tool-calling schema, context length and output behaviour; maintain **per-model prompt adapters** and run **evals on every fallback path** (a fallback that nobody has tested is a hidden outage).
- Structured outputs and tool schemas may need translation; verify with contract tests.
- Quality drop on fallback should be known and acceptable, and sometimes surfaced to the user.

**High availability:** multi-zone/multi-region active-active, no single provider dependency for critical flows, autoscaling for self-hosted inference, capacity reservations, regular **game days/chaos tests** (kill the primary provider in staging).

**Observability and SLOs:** availability and latency SLOs per user journey, alerts on error budget burn, provider status integration, tracing across fallbacks (which model actually served the request), cost tracking of fallback usage.
