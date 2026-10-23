**Idea (Wang et al., 2022):** instead of one greedy chain of thought, sample **several diverse reasoning paths** (temperature about 0.5 to 1.0) and take the **majority vote** of the final answers. Correct reasoning paths tend to converge on the same answer, while errors scatter.

```python
from collections import Counter

def self_consistent_answer(llm, question, n=7):
    answers = []
    for _ in range(n):
        out = llm(f"{question}\nThink step by step, then end with 'Answer: <value>'.", temperature=0.8)
        answers.append(out.rsplit("Answer:", 1)[-1].strip())
    value, votes = Counter(answers).most_common(1)[0]
    return value, votes / n          # vote share = rough confidence
```

**Why it works:** it marginalises over reasoning paths, reducing the effect of one flawed chain; it also gives a confidence estimate (low agreement means uncertain, so abstain or escalate).

**Benefits:** often large gains on arithmetic, commonsense and symbolic reasoning over single-chain CoT, with no training.

**Costs and limits**

- `n` times the tokens and (unless parallelised) latency.
- Needs answers that can be compared (numbers, labels, normalised strings); for free-form text use a judge or "universal self-consistency".
- If the model is systematically wrong, voting amplifies the error.
- Diminishing returns beyond about 10 to 20 samples; use temperature above 0, otherwise all samples are identical.
