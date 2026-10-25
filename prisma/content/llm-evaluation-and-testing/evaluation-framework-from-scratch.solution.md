**Step 1: Define success.** Write user-centred requirements and failure costs: quality dimensions (correctness, faithfulness, tone, format), safety rules, latency and cost budgets. Turn them into **metrics with thresholds** (the definition of done).

**Step 2: Create the first dataset (20 to 100 cases, quickly).** Real or realistic inputs, spanning common cases, edge cases, adversarial inputs, and each user segment; add expected outputs, key facts, or rubrics; keep a **dev split and a frozen test split**.

**Step 3: Build evaluators in order of cheapness and reliability**

1. **Deterministic checks:** schema/format, required fields, citations, banned content, PII, length, tool-call validity.
2. **Execution/reference-based checks** where possible (unit tests, SQL results, exact facts).
3. **LLM-judge with rubrics** for subjective or open-ended quality; write specific criteria with examples; validate against 50 to 100 human-labelled items.
4. **Human review** loop for calibration and hard cases.
5. For RAG/agents: add component metrics (retrieval recall/precision, tool-call accuracy, step efficiency).

**Step 4: Baseline.** Run the simplest prompt/model to get a baseline score and cost; look at failures and cluster them.

**Step 5: Build the harness.** A script or framework (promptfoo, DeepEval, Ragas, LangSmith, Braintrust, OpenAI Evals, or pytest) that runs the system on the dataset, stores outputs, scores, traces, token cost and latency per run, versions everything (data, prompt, model, judge), and compares runs with diffs and confidence intervals.

```python
def run_eval(system, dataset, evaluators):
    rows = []
    for case in dataset:
        out = system(case["input"])
        rows.append({"id": case["id"], **{e.__name__: e(case, out) for e in evaluators}})
    return rows        # aggregate by slice, compare against stored baseline
```

**Step 6: Iterate with discipline.** Change one variable at a time; track metric movements per slice; read failures; expand the dataset where the system fails.

**Step 7: Automate.** Run a fast suite in CI on every change with regression gates; a larger nightly suite; scheduled canary against production to catch provider changes.

**Step 8: Production loop.** Trace and sample live traffic, run online evaluators, collect user feedback, alert on drift, and convert failures to new test cases.

**Step 9: Governance.** Document metrics and thresholds, privacy handling for logged data, ownership, review cadence, safety and fairness audits, red-teaming before launch.

**Anti-patterns:** shipping on vibes, one aggregate score, an unvalidated LLM judge, tuning on the test set, ignoring cost/latency, and letting the dataset go stale.
