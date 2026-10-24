```python
import json, statistics
from concurrent.futures import ThreadPoolExecutor

RUBRIC = '''Score the ANSWER to the QUESTION using the REFERENCE.
- correctness (1-5): 5 = fully matches the reference facts, 1 = wrong
- faithfulness (1-5): 5 = no claims beyond the reference/context
- completeness (1-5): 5 = covers every key point
Return JSON only: {"reasoning": "...", "correctness": n, "faithfulness": n, "completeness": n}'''

def judge(llm, question, answer, reference):
    prompt = f"{RUBRIC}\n\nQUESTION: {question}\nREFERENCE: {reference}\nANSWER: {answer}"
    for _ in range(3):                                   # retry on malformed JSON
        raw = llm(prompt, temperature=0)
        try:
            r = json.loads(raw)
            if all(1 <= r[k] <= 5 for k in ("correctness", "faithfulness", "completeness")):
                return r
        except (json.JSONDecodeError, KeyError, TypeError):
            pass
    return None

def evaluate(dataset, system_under_test, judge_llm, workers=8):
    def one(item):
        answer = system_under_test(item["question"])
        return {**item, "answer": answer, "scores": judge(judge_llm, item["question"], answer, item["reference"])}
    with ThreadPoolExecutor(workers) as ex:
        rows = list(ex.map(one, dataset))
    ok = [r for r in rows if r["scores"]]
    summary = {k: statistics.mean(r["scores"][k] for r in ok)
               for k in ("correctness", "faithfulness", "completeness")}
    summary["judge_failures"] = len(rows) - len(ok)
    return summary, rows
```

**Making the judge trustworthy**

- **Calibrate against humans:** label 50 to 100 examples by hand, compare agreement (e.g. Cohen's kappa); fix the rubric until aligned.
- **Known biases:** position bias (shuffle order in pairwise comparisons and run both orders), verbosity bias, self-preference (use a different model family as judge), leniency.
- Put **reasoning before the score** and use `temperature=0`.
- Use **pairwise comparison** for A/B tests of two systems; use **reference-based** grading when ground truth exists.
- Track **judge cost and variance**; sample multiple judgments for borderline cases.
- Keep deterministic checks (format, citations present, regex) separate from judged qualities.
