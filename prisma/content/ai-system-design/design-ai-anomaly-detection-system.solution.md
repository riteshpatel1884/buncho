**Requirements:** millions of time series, logs and traces, detection within a minute, few false positives (alert fatigue), seasonality awareness, root-cause assistance, integration with on-call tools.

**Architecture**

```text
Telemetry (metrics, logs, traces, events, deploys) -> OpenTelemetry/Kafka -> stream processing + storage (TSDB, log store)
   -> Detection layer:
        metrics: statistical baselines (seasonal decomposition, robust z-scores), forecasting residuals,
                 isolation forest / autoencoders / transformers on multivariate series
        logs: template mining (Drain), rare-template and rate-change detection, embedding-based novelty
        traces: latency/error shifts per service/endpoint, dependency-graph changes
   -> Correlation & grouping (time, topology, deploy/config changes) -> incident candidate
   -> Ranking/suppression (severity, user impact, SLO burn, known maintenance)
   -> LLM assistant: summarise evidence, link likely cause (recent deploy, upstream failure), retrieve runbooks/past incidents
   -> Alert (PagerDuty/Slack) + feedback (true/false positive) -> tuning/retraining
```

**Design decisions**

- **Start simple:** robust seasonal baselines and SLO-based alerting solve most cases; ML adds value on high-cardinality and multivariate patterns. Always keep a deterministic fallback.
- **Handle seasonality and drift:** daily/weekly patterns, holidays, deploy-induced level shifts; adaptive baselines and change-point handling.
- **Reduce alert noise:** deduplicate and **group correlated anomalies into one incident** using the service topology; suppress during maintenance windows; require persistence over a window.
- **Root cause:** correlate with change events (deploys, config, feature flags), use dependency graphs and trace analysis; LLM turns the evidence into a readable summary and suggests runbook steps, **with citations to the telemetry**, never taking destructive actions automatically.
- **Labels are scarce:** use operator feedback, incident postmortems and synthetic anomaly injection for evaluation.
- **Scale:** per-series models are too expensive at millions of series; use shared/global models, hierarchical aggregation and sampling.
- **Cost:** hot/cold telemetry tiers, downsampling, sketches.

**Metrics:** precision/recall on labelled incidents, mean time to detect and to resolve, alert volume per on-call shift, % actionable alerts, false-positive rate, detection latency.
