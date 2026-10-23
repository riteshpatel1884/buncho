**Treat prompts like code with tests.**

**1. Define success:** task metrics (accuracy, F1), format validity, safety, tone, latency, cost.

**2. Build an eval set**

- 50 to 500 real inputs covering common cases, edge cases, adversarial cases and past failures; with expected outputs or rubrics.
- Keep a held-out set you do not tune on.

**3. Choose scorers**

| Output type | Scorer |
|---|---|
| Classification / extraction | Exact match, F1, schema validity |
| Maths, code | Execution against tests |
| Free text | **LLM-as-judge** with a rubric (check agreement with human labels, randomise order to reduce position bias), pairwise comparison, human review sample |
| RAG | Groundedness / faithfulness, citation accuracy |

**4. Iterate scientifically**

- Change **one thing at a time**; run every variant on the same set; run multiple samples if output is stochastic (or use temperature 0).
- Look at failures by category (error analysis) before editing.
- Use statistical caution: small differences on small sets are noise.

```python
def evaluate(prompt_fn, dataset, scorer):
    scores = [scorer(prompt_fn(x["input"]), x["expected"]) for x in dataset]
    return sum(scores) / len(scores)

baseline, candidate = evaluate(v1, data, score), evaluate(v2, data, score)
```

**5. Ship safely:** CI regression tests on prompt changes, shadow or A/B test in production, version prompts and log the version per request.

**6. Monitor:** user feedback, format-failure rate, drift when the underlying model changes (re-run evals on every model upgrade).
