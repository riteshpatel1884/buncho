| Benchmark | Measures | Format and scoring |
|---|---|---|
| **MMLU** | Broad knowledge across 57 subjects (STEM, humanities, law, medicine) | Multiple choice, usually 5-shot; accuracy (random = 25%). Harder variants: **MMLU-Pro**, GPQA |
| **HumanEval** | Python function synthesis (164 problems) | Generated code run against unit tests; **pass@k** |
| **GSM8K** | Grade-school maths word problems (about 8.5K) | Exact match on final numeric answer, often with chain-of-thought; harder: MATH, AIME |
| Others | HellaSwag (commonsense), TruthfulQA (truthfulness), BBH, IFEval (instruction following), SWE-bench (repo-level coding), MT-Bench/Arena (chat quality), LiveCodeBench (fresh problems) | Varies |

**pass@k (unbiased estimator):** generate $n$ samples per problem, $c$ pass the tests:
$$\text{pass@}k = 1-\binom{n-c}{k}\Big/\binom{n}{k}$$

```python
from math import comb
def pass_at_k(n, c, k):
    return 1.0 if n - c < k else 1 - comb(n - c, k) / comb(n, k)
print(pass_at_k(10, 3, 1), pass_at_k(10, 3, 5))   # 0.3, 0.9167
```

**Interpreting results**

- A score depends on **prompting setup** (zero/few-shot, chain-of-thought, answer extraction, temperature, number of samples), so only compare numbers computed with the same harness and settings.
- **Saturation:** top models cluster near the ceiling (MMLU, GSM8K, HumanEval), so differences are small and noisy; use harder or fresher benchmarks.
- **Contamination and overfitting:** leaked test sets or targeted tuning inflate scores.
- **Narrow measurement:** multiple choice does not test open-ended generation, tool use, long context, safety or user experience; label noise exists in some benchmarks.
- **Statistical noise:** report confidence intervals; differences under 1 to 2 points are often meaningless on small sets.
- **Aggregate hides slices:** check per-subject or per-category results relevant to you.

**Use benchmarks for** shortlisting models, tracking broad capability, and comparing with published results; **not** for final selection. Always evaluate on **your own task-specific eval set**.
