**Four layers of monitoring**

| Layer | Metrics | Alert examples |
|---|---|---|
| **Reliability and performance** | Error rate (4xx/5xx/timeouts), availability, latency (TTFT, total, p95/p99), throughput, queue depth, retries, fallback rate | Error rate > 2% for 5 min; p99 > SLO |
| **Cost and usage** | Input/output tokens per request, cost per request/user/feature, cache hit rate, context length distribution | Daily spend > budget; sudden token growth |
| **Quality** | Online evals on sampled traffic (LLM-judge: relevance, faithfulness, helpfulness), format/schema validity, retrieval metrics (recall, empty results), refusal rate, user feedback (thumbs, edits, regenerations, abandonment), task success | Judge score drops 5%; thumbs-down spike |
| **Safety and security** | Guardrail triggers, PII detections, jailbreak/injection attempts, toxic outputs, policy violations | Any critical safety event |

**How to collect**

- **Instrument every request with traces** (prompt version, model, parameters, retrieved chunks, tool calls, tokens, latency per step) using OpenTelemetry-style tooling or LLM observability platforms (Langfuse, LangSmith, Arize, Datadog LLM Observability).
- Log structured events with user/session/tenant ids, with **PII redaction** and retention rules.
- Run **asynchronous evaluators** on a sample (e.g. 1 to 5% of traffic) plus all flagged cases; send results to dashboards.
- Capture **explicit and implicit feedback** and link it to traces.

**Detecting drift and regressions**

- **Input drift:** topic, language and length distributions, embedding-space shift of queries.
- **Output drift:** length, refusal rate, style, judge scores over time.
- **Provider/model changes:** pin model versions, run a **canary eval suite on a schedule** to catch silent upstream changes.
- **Release markers** on dashboards (prompt, model, index versions) to correlate changes.

**Operate it:** SLOs with error budgets, paging only for user-impacting issues, runbooks per alert, weekly review of worst traces, and a loop that turns failures into regression test cases.
