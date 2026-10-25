**Evaluation-driven development** is test-driven development adapted to probabilistic systems: you define **how success is measured before you build**, then iterate on prompts, retrieval, models and agents while the evaluation suite tells you whether each change helped.

**The loop**

```text
1. Define done  ->  2. Build an eval set + metrics  ->  3. Baseline (simple prompt)
4. Change one thing (prompt/model/retrieval/tool)  ->  5. Run evals, compare to baseline
6. Ship if gates pass  ->  7. Monitor production  ->  8. Turn failures into new eval cases  (back to 4)
```

**Why "AI is only as good as our definition of done"**

- A model optimises what you measure. If done means "the demo looked good", you get a demo-quality system that fails on real inputs.
- LLM output is open-ended, so without explicit criteria teams argue from anecdotes and regress silently when prompts or models change.
- A good definition is **specific, measurable and tied to user outcomes**, e.g. "answers support questions with at least 90% factual accuracy on the golden set, cites a source for 95% of claims, never discloses PII, p95 latency under 3 s, cost under $0.02 per ticket".
- It includes **non-functional and safety requirements** (latency, cost, refusal behaviour, fairness), plus **thresholds** and who signs off.

**Practices**

- Start with 20 to 50 realistic examples, including hard and adversarial cases, before writing the first prompt; grow the set from production failures.
- Mix **deterministic checks** (format, schema, citations present, forbidden content) with **model-based and human evaluation** for quality.
- Version datasets, prompts, judges and results; gate releases in CI on regressions.
- Review failures qualitatively, not only aggregate scores; read traces weekly.
- Revisit the definition of done as users and risks change, since the metric can drift away from the real goal (Goodhart's law).

**Benefits:** faster, safer iteration, objective model/provider comparisons, fewer regressions, and shared understanding between product, engineering and domain experts.
