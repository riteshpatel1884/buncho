**Goal:** detect when a change makes behaviour worse on cases that used to work, before users see it.

**1. Sources of test cases**

- **Production failures and bug reports** (the best source): every fixed bug becomes a test.
- Representative **traffic samples** (anonymised), stratified by intent/topic/language/difficulty.
- **Edge cases** and adversarial inputs (empty input, very long, mixed languages, prompt injection, ambiguous requests).
- **Critical flows** with business or safety importance (refund policy, medical disclaimers, PII handling).
- Cases written by domain experts; synthetic variations (paraphrases) for coverage.

**2. Test types**

| Type | Example | Determinism |
|---|---|---|
| Deterministic assertions | Valid JSON/schema, required fields, regex, citations present, no PII, correct tool called | Exact |
| Reference-based | Expected answer or key facts present | Semi-exact (normalise) |
| Model-graded | Rubric score, faithfulness, tone via LLM judge | Statistical |
| Behavioural/metamorphic | Paraphrase gives equivalent answer; irrelevant context does not change it | Statistical |
| Safety | Refuses harmful requests; resists injection | Exact + judge |
| Non-functional | Latency, tokens, cost budgets | Exact |

**3. Handling non-determinism:** temperature 0 and fixed seeds where possible; run flaky cases several times and use **pass rate thresholds**; compare score distributions with confidence intervals instead of requiring identical text; tolerate small variation but fail on significant drops.

**4. Run and gate**

```text
PR changes prompt/model/index -> run fast suite (50-200 critical cases) in CI -> compare to stored baseline
   -> fail on: any critical-case failure, aggregate drop > threshold, latency/cost regression
nightly/pre-release: full suite (thousands of cases) + safety suite
scheduled: run against the production model alias to catch silent provider changes
```

**5. Maintain:** version the dataset, expected outputs, judge prompts and baselines; review failures to decide if the test or the system is wrong; prune obsolete cases; track suite health (flakiness, coverage by slice); store results to chart trends.

**Tools:** promptfoo, DeepEval, Ragas, LangSmith, Braintrust, OpenAI Evals, pytest with custom evaluators.
