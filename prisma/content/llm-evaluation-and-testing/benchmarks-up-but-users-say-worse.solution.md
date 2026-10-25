**Why benchmarks and users disagree**

1. **Distribution mismatch:** benchmarks (multiple choice, exam-style, short prompts) differ from real usage (long context, messy prompts, multi-turn, domain jargon, other languages).
2. **Unmeasured behaviours changed:** tone, verbosity, formatting (more markdown/lists), refusal rate, hedging, **instruction following of your system prompt**, tool-call format, output structure, personality, response length, latency, cost.
3. **Overfitting/contamination:** the model was tuned toward public benchmarks (or contaminated), gaining scores without general improvement.
4. **Prompt sensitivity:** your carefully tuned prompts, parsers and few-shot examples were built for the old model; the new one reads instructions differently (breaks JSON format, ignores constraints, changes verbosity).
5. **Regressions in niche skills** hidden by averages (specific languages, formats, long-tail topics, tools).
6. **Safety/alignment tuning side effects:** more over-refusals or more cautious answers.
7. **Serving changes:** quantisation, different sampling parameters, tokenizer/chat template, context truncation, streaming/latency issues.
8. **Metric/user mismatch:** users value consistency, speed and predictability, which benchmarks ignore; sample bias in feedback (vocal minority).

**Investigation**

1. **Quantify the complaint:** segment feedback and online metrics (thumbs, regenerations, edits, abandonment, escalations) by feature, language, user cohort, prompt length; confirm it is real, not seasonal.
2. **Replay production traffic** (sampled, anonymised) through old and new versions; compare with pairwise LLM-judge and human review on the **same inputs**; read many diffs.
3. **Diff measurable properties:** output length, refusal rate, format validity, tool-call accuracy, latency, token usage, citation rate, language mix.
4. **Slice analysis:** find categories where the new model loses even if the aggregate wins.
5. **Check the pipeline:** system prompt compatibility, sampling parameters, chat template, truncation, retrieval changes bundled in the release.
6. **Add the failures to the eval set** so the new suite reflects real use.

**Resolution:** roll back or canary; adapt prompts and parsers to the new model; adjust sampling; choose a different model for failing slices (routing); fine-tune on failure cases; negotiate release gates that include **task-specific evals, human preference and online metrics**, not only public benchmarks.

**Lesson:** benchmarks are necessary but insufficient; choose models by **your** evals and validate with A/B tests before full rollout.
