**1. Design**

- Define the **primary metric and decision rule** before running (e.g. adopt B if accuracy improves by at least 2 points with 95% confidence and cost does not rise more than 10%).
- Use the **same evaluation items for both systems (paired design)**: far more statistical power than independent samples.
- Estimate **sample size** from the expected effect and variance (power analysis); small eval sets (50 to 100) only detect big differences.
- **Randomise** order and blind graders; control seeds, temperature and prompt versions; keep other components fixed.

**2. Measure noise sources**

- **Item sampling noise** (which examples you picked) and **model/run noise** (non-determinism, sampling). Run multiple samples per item at the production temperature when relevant.
- **Judge noise** if using LLM-graders: repeat judgments, calibrate against humans, randomise pairwise order.

**3. Tests and intervals**

| Data | Test / method |
|---|---|
| Paired binary correct/incorrect | **McNemar's test** (only discordant pairs matter); paired bootstrap CI for the accuracy difference |
| Paired scores (1 to 5, continuous) | Paired t-test or **Wilcoxon signed-rank**; bootstrap CI of mean difference |
| Pairwise preferences (A vs B) | **Binomial/sign test** on win rate (ties handled separately); Bradley-Terry for many models |
| Many models/prompts | Correct for **multiple comparisons** (Bonferroni, Holm, Benjamini-Hochberg) |
| Clustered data (multiple items per document/user) | Cluster bootstrap or mixed-effects models |

```python
import numpy as np
def paired_bootstrap(a_correct, b_correct, n=10_000, seed=0):
    rng = np.random.default_rng(seed)
    d = np.asarray(b_correct, int) - np.asarray(a_correct, int)    # per-item difference
    boots = [rng.choice(d, len(d)).mean() for _ in range(n)]
    return d.mean(), np.percentile(boots, [2.5, 97.5])
# e.g. mean +0.15 with 95% CI [0.08, 0.22]: B is better, since the interval excludes 0
```

**4. Report effect sizes and intervals, not only p-values:** "B is +3.1 points (95% CI 0.9 to 5.3)", plus cost/latency changes and per-slice results.

**5. Pitfalls**

- Declaring a winner from a 1-point gap on 100 items; **peeking** repeatedly and stopping when significant (inflates false positives).
- **Overfitting to the eval set** by tuning prompts on it (use dev/test splits).
- Ignoring variance across seeds and prompt phrasings; p-hacking across many metrics and slices.
- Confusing statistical significance with practical significance.
- Contaminated or unrepresentative datasets.

**For online A/B tests:** randomise users, pre-register metrics, run full weekly cycles, check sample-ratio mismatch, and use sequential testing methods if you must monitor continuously.
