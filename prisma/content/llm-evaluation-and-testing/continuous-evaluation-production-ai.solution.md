**Goal:** detect quality regressions, drift and new failure modes quickly, and turn them into improvements.

**Architecture**

```text
Production traffic -> tracing/logging (inputs, context, outputs, versions, latency, cost, feedback)
   -> Sampler (random + risk-based: low confidence, negative feedback, long, new topics, flagged)
   -> Evaluators (async):
        deterministic checks (schema, citations, PII, safety filters)
        LLM-judges (relevance, faithfulness, helpfulness, policy) calibrated to human labels
        retrieval metrics (empty results, score distributions), tool-call validity
   -> Aggregation: metrics by version/slice/time -> dashboards + alerts (control charts, thresholds, anomaly detection)
   -> Human review queue for flagged and a random audit sample
   -> Triage -> fixes (prompt/retrieval/model) + new regression cases -> CI/canary gates -> deploy
```

**Key design choices**

- **Sampling:** 1 to 5% of traffic randomly (unbiased estimate) plus **100% of high-risk signals**; keep costs bounded with cheaper judges for screening.
- **Reference-free metrics** (no ground truth online): faithfulness to retrieved context, answer relevance, format validity, toxicity, user feedback, consistency across samples.
- **Delayed ground truth:** join later outcomes (resolution, chargebacks, edits, conversions) for retrospective accuracy.
- **Versioned everything:** record prompt, model, index and config versions on each trace so changes can be correlated with score moves.
- **Drift monitoring:** input distribution (topics, languages, lengths, embeddings), output distribution (length, refusals), retrieval health, judge scores; compare with a reference window.
- **Canary evaluation on schedule:** run the golden set against the live endpoint daily/hourly to catch **silent provider updates** and infrastructure regressions.
- **Alerting:** statistically meaningful thresholds (e.g. judge score down by more than a margin over a window), with severity levels; avoid alert fatigue.
- **Close the loop:** weekly review of worst traces and trends; failures become golden/regression cases; track metrics like time to detect and time to fix.
- **Governance:** privacy (redaction, retention, access control), judge audits against humans, documentation.

**Tools:** Langfuse, LangSmith, Arize Phoenix, Braintrust, Datadog LLM observability, custom pipelines with Airflow/queues.

**Metrics for the program:** eval coverage (% of traffic and slices), detection latency, false-alert rate, judge-human agreement, share of production failures converted into tests.
