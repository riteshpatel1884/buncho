**SLI/SLO/SLA:** an **SLI** is a measured indicator, an **SLO** is the internal target for it, an **SLA** is the external contractual commitment (with penalties). Set SLOs per user journey and model tier.

| Category | Metric (SLI) | Notes / example target |
|---|---|---|
| **Availability** | Successful request rate; uptime | 99.9% monthly for core chat (about 43 min downtime); define "success" to exclude user errors and include timeouts |
| **Latency** | **Time to first token (TTFT)**, inter-token latency (ITL/TPOT), end-to-end latency; p50/p95/p99 | Chat: TTFT p95 < 1 to 2 s; ITL < 50 to 100 ms; autocomplete < 300 ms; voice < 1 s; use percentiles, never averages |
| **Throughput and capacity** | Requests/s, tokens/s (input and output), concurrent streams, queue wait, GPU/KV utilisation | Capacity at SLO, headroom 30 to 50% |
| **Quality** | Task success, groundedness/faithfulness, accuracy on eval sets, hallucination rate, format validity, user satisfaction | Judge-score floor; alert on regressions vs baseline |
| **Safety** | Policy violation rate, jailbreak success, PII leakage incidents | Critical: zero tolerance targets with detection SLAs |
| **Cost** | Cost per request/user/task, tokens per request, cache hit rate | Budget per feature; alert on drift |
| **Reliability** | Error rate by type (429, 5xx, timeouts), retry and fallback rates, recovery time (MTTR) | Error budget policy |
| **Freshness (RAG)** | Index lag (time from document change to searchable), data staleness | e.g. < 15 min |

**LLM-specific points**

- **Define latency for streaming** at two points (TTFT and tail of the stream); throughput and latency trade off through batch size.
- **Quality SLOs are statistical** and measured on sampled traffic with evaluators; include them in release gates and error budgets.
- **Depend on provider SLAs:** your availability is bounded by theirs; build fallbacks to exceed it. Rate-limit and quota headroom is part of availability.
- Use **error budgets:** when burned, freeze risky releases and prioritise reliability work.
- Segment by tenant, model, region, request size (long prompts have different latency).

**Alerting:** page on fast burn of availability/latency budgets and critical safety events; ticket on slower trends (quality drift, cost creep). Review SLOs quarterly against user impact.
