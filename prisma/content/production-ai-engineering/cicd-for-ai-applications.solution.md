**Traditional CI/CD:** code change, build, deterministic unit/integration tests, deploy. Pass/fail is binary.

**AI CI/CD** must also handle **non-deterministic outputs**, changes that are not code (prompts, models, retrieval indexes, tool schemas, config), and costs that scale with usage.

```text
Change (prompt / model / index / code / config) -> PR
CI: lint + unit tests (parsers, tool functions, guardrail rules)
    -> offline evaluation suite on golden dataset (accuracy, faithfulness, format, safety, latency, cost)
    -> regression gates vs baseline (no metric worse than a threshold; statistical comparison)
    -> red-team/safety tests, prompt-injection tests, PII leakage tests
CD: build artefacts (versioned prompt bundle, container, index) -> stage -> shadow/canary -> A/B -> progressive rollout
    -> automated rollback on SLO/quality breach
Post-deploy: monitoring, online evals, feedback to dataset
```

**Key differences**

| Aspect | Traditional | AI applications |
|---|---|---|
| Tests | Deterministic assertions | Statistical **evals** with thresholds; LLM-judges; flaky by nature (repeat runs, fixed seeds, temperature 0) |
| Artefacts | Code, binaries | Code + **prompts, models/adapters, vector indexes, datasets, eval sets** (all versioned) |
| Triggers | Code commits | Also **model/provider updates**, data changes, drift alerts, scheduled eval runs |
| Release | Feature flag/canary | Canary + **quality-based** gating and A/B tests |
| Cost | Build minutes | **Eval runs cost tokens**: cache, sample, tier (fast suite on PR, full suite nightly) |
| Rollback | Redeploy previous build | Revert prompt/model/index version; may require re-pointing aliases |

**Practices**

- Keep a **golden dataset** that grows from production failures; version it and the judge prompts.
- Pin model versions; run a **scheduled canary eval** to detect provider-side changes.
- Separate fast checks (minutes, on every PR) from slow ones (nightly/pre-release).
- Make evaluation results visible in the PR (scores, diffs of outputs, examples of regressions).
- Use infrastructure as code for gateways, guardrails and prompts; require review for prompt changes like code.
