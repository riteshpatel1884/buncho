**Requirements:** reproducible offline experiments, CI gating on regressions, online monitoring, human review, support for RAG and agents, many teams.

**Components**

```text
Datasets (versioned, tagged slices) -- Test-case registry (inputs, references, metadata)
Runners (sandboxed, parallel): call system under test (prompt/model/RAG/agent) -> outputs + traces
Evaluators: deterministic (exact match, regex, JSON schema, unit tests, citation checks)
            model-based (LLM judge with rubric, pairwise, reference-based)
            human review queue (labelling UI, adjudication)
Results store: runs, scores, traces, cost, latency -> comparison UI, dashboards, alerts
CI integration: pass/fail gates   Production: sampled traffic -> same evaluators
```

**Design points**

- **Versioning everything:** dataset version, prompt/model/config version, evaluator version, seed, so runs are comparable.
- **Evaluator quality:** calibrate LLM judges against human labels; track agreement; use different judge models from the system under test; randomise order in pairwise comparisons.
- **Metric types:** correctness, faithfulness/groundedness, relevance, safety, format validity, latency and cost; for RAG add retrieval recall and context precision; for agents add task success, tool-call accuracy, step count.
- **Statistics:** confidence intervals, paired comparisons, slice analysis (by language, topic, difficulty) to avoid averages hiding regressions.
- **Production loop:** sample real traffic, redact PII, run online evals, collect user feedback, turn failures into new test cases (data flywheel).
- **Cost control:** cache model calls for unchanged inputs, sample large datasets, use cheaper judges for screening.
- **Governance:** access control, audit trail, PII handling in datasets.

**Failure modes:** judge bias and drift, test-set contamination/overfitting, flaky non-determinism (use repeats), unrepresentative datasets.

**Metrics for the platform itself:** time to run an eval suite, evaluator agreement with humans, regression catch rate, adoption.
