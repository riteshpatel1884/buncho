**Key principle:** keep the **real-time decision path** on fast, calibrated ML models (milliseconds, deterministic, auditable) and use **LLMs where language and reasoning help**: unstructured data, investigation, explanation and rule generation.

**Architecture**

```text
Transaction/event -> Feature service (velocity, device, geo, graph features, history; streaming + batch)
   -> Real-time scoring: rules + GBDT/graph/sequence models -> risk score (<50 ms)
        low risk: approve | high risk: block/step-up auth | middle: review
   -> Case management: LLM investigator agent (summarise account, linked entities, past cases,
        retrieve similar cases, draft rationale and SAR narrative) -> analyst decision
   -> Feedback labels (chargebacks, confirmed fraud) -> retraining
```

**Where LLMs add value**

- **Unstructured signals:** merchant descriptions, support chats, KYC documents, emails, social-engineering/scam message detection.
- **Analyst copilot:** summarise evidence, link entities (shared device/address), explain the score, draft case notes and regulatory reports; reduces handling time.
- **Rule and feature generation:** propose rules from new fraud patterns for human approval.
- **Synthetic data/simulation** of fraud scenarios for testing.
- **Scam conversation analysis** (romance/investment scams) for warnings.

**Design decisions**

- Do **not** put an LLM on the critical latency path or give it final authority over blocking; use it for triage and explanation, with human review for adverse actions.
- **Imbalance and drift:** fraud is under 1% of events and adversaries adapt; use precision-recall metrics, cost-sensitive thresholds, frequent retraining, challenger models and drift monitoring.
- **Labels are delayed** (chargebacks take weeks): handle with delayed-label pipelines and proxies.
- **Explainability and fairness:** reason codes for declines, adverse-action rules, bias audits, regulatory compliance (AML/KYC, PCI-DSS, GDPR).
- **Security of the LLM component:** prompt injection in customer-provided text, PII minimisation, audit logs.

**Metrics:** fraud caught (recall) at a fixed false-positive rate, loss prevented vs customer friction, analyst time per case, model latency, drift alerts.
