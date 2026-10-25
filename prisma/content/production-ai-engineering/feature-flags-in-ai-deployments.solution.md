**Feature flags** decouple **deploying** code/artefacts from **releasing** behaviour. They let you change what users get at runtime, without redeploying, using targeting rules (percentage, user segment, tenant, region, plan).

**Uses in AI systems**

- **Progressive rollout:** enable a new model, prompt or RAG pipeline for 1%, 10%, 50%, then everyone, watching quality, latency and cost at each step.
- **A/B experiments:** assign variants by stable user hash, and record the variant on every trace.
- **Kill switch:** instantly disable a misbehaving feature, an agent tool, or a risky capability (web browsing, code execution) and fall back to a safe path.
- **Model and prompt routing:** flags select model version, prompt version, temperature or retrieval settings; rollback is a flag flip.
- **Cost and capacity control:** reduce features under load (shorter context, smaller model, disable reasoning mode), cap expensive features by plan.
- **Safety gating:** release new capabilities first to internal users or trusted testers (dogfooding), then beta, then GA.
- **Per-tenant customisation** in multi-tenant platforms.

```python
if flags.enabled("rag_v2", user=user):
    answer = rag_v2(question)          # new retrieval + prompt version
else:
    answer = rag_v1(question)
log(trace, variant="rag_v2" if flags.enabled("rag_v2", user=user) else "rag_v1")
```

**Best practices**

- Evaluate flag changes like deployments: automated metrics checks with **auto-rollback**.
- Log the flag state in traces so incidents can be correlated.
- Keep the old path working until the new one is proven; **remove stale flags** to avoid complexity.
- Control access and audit flag changes; test both branches in CI.
- Tools: LaunchDarkly, Unleash, Flagsmith, Statsig, or a simple config service.
