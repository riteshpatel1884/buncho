**What to record per decision (immutable event)**

```json
{
  "decision_id": "uuid", "timestamp": "2026-10-25T06:56:00Z",
  "subject_ref": "hashed-user-id", "request_id": "trace-id",
  "model": {"name": "credit-risk", "version": "2.4.1", "artifact_hash": "sha256:..."},
  "prompt_or_features_ref": "s3://audit/inputs/abc.json",   // snapshot or content-addressed pointer
  "config": {"threshold": 0.62, "temperature": 0, "policy_version": "p17", "retrieval_index": "v88"},
  "output": {"decision": "reject", "score": 0.71},
  "explanation": {"top_factors": ["dti", "recent_delinquency"], "method": "shap@1.4"},
  "guardrails": {"pii_redacted": true, "flags": []},
  "human_review": {"reviewer": "u123", "action": "upheld", "reason": "..."}
}
```

**Design principles**

1. **Capture at decision time**, not reconstruct later: inputs, feature values, model + data + prompt versions, retrieved documents, tool calls, outputs, scores, thresholds, explanation, human overrides.
2. **Versioned registry** (model, prompt, policy, feature definitions) so each log points to exact artefacts.
3. **Integrity:** append-only/WORM storage, hash chains or signed entries, restricted access, separation of duties.
4. **Privacy:** minimise and pseudonymise; encrypt; field-level redaction; retention aligned with law (EU AI Act high-risk logs at least 6 months; finance/health often years) and erasure rights.
5. **Queryability:** index by decision/user/model version/time; dashboards; export for regulators.
6. **Tracing:** correlate across services (OpenTelemetry), including agent steps and tool calls.
7. **Replay capability:** ability to re-run a decision with the same artefacts (within the non-determinism tolerance).
8. **Operational:** alert on logging failures (fail closed for high-risk), test retrieval of old decisions regularly, document the process.

**If you have no logs today:** you cannot truthfully reconstruct past decisions; disclose the limitation, use available proxies (model version in deploys, input records) to give a best-effort explanation clearly labelled as such, and implement the above going forward.
