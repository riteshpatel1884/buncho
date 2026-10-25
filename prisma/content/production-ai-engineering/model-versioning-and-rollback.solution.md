**Model versioning** means giving every deployable model artefact a unique, immutable identity and recording how it was produced, so any production answer can be traced to exact versions and any change can be reversed.

**What to version (the "release bundle")**

- **Model:** base model id + provider version/snapshot date (never an unpinned "latest" alias), fine-tuned weights, LoRA adapters, quantisation settings, tokenizer and chat template.
- **Prompts and configuration:** system prompt, templates, temperature and other parameters, tool schemas, guardrail policies.
- **Retrieval:** embedding model, index version, chunking settings, reranker.
- **Data and evals:** training/fine-tuning dataset version, eval set version, eval results.
- **Code and infrastructure versions.**

Use a **model registry** (MLflow, Weights & Biases, Hugging Face Hub, cloud registries) with metadata: lineage, metrics, owner, approval status, and stages (staging, production, archived).

**Routing and rollout**

- Applications call **aliases** (`assistant-prod`) that point to a specific bundle; changing the alias changes the version without code changes.
- Roll out progressively: shadow, canary (1 to 5%), A/B, then 100%, with automatic checks on quality, latency, cost and safety.
- Keep the **previous version warm** (deployed and ready) for instant rollback; for self-hosted models keep weights cached on nodes.

**Rollback**

1. **Triggers:** SLO breach, quality score drop, safety incident, cost spike, user complaints.
2. **Mechanism:** flip the alias or feature flag to the last known-good bundle (seconds), not a rebuild.
3. **Compatibility:** make sure rollback is safe: prompts match the model, embedding model and index version go together, schemas are backward compatible, and stored state (memory, conversation formats) is readable by both versions.
4. **Post-mortem:** capture failing cases as regression tests before trying again.

**Provider-hosted models:** providers deprecate versions, so track deprecation dates, pin snapshots, and rehearse migrations. **Stateful issues:** fine-tuned model rollbacks may need data migrations; embedding model changes require re-indexing, so rollback means keeping the old index alive.
