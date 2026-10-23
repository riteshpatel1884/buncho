**1. The numbers**

- Difference: 4.20% - 4.00% = **+0.20 percentage points** (+5% relative).
- Pooled rate 4.1%; standard error of the difference about 0.125 pp.
- z about **1.60**, two-sided **p about 0.11**.
- 95% confidence interval for the difference: about **-0.05 pp to +0.45 pp**.

```python
from statsmodels.stats.proportion import proportions_ztest, confint_proportions_2indep
z, p = proportions_ztest([2100, 2000], [50000, 50000])                 # p about 0.11
lo, hi = confint_proportions_2indep(2100, 50000, 2000, 50000)           # about (-0.0005, 0.0045)
```

**Interpretation:** the result is **not statistically significant** at 0.05. The data are compatible with no effect, with a small harm (-0.05 pp), and with a decent gain (+0.45 pp). It does not prove the models are equal.

**2. What is wrong**

- **"89% chance the new model is better" is a misreading.** A p-value is `P(data this extreme | no true difference)`, not `P(hypothesis | data)`. It says nothing directly about the probability that the treatment is better (that needs a Bayesian analysis with a prior).
- **Peeking:** testing every day and stopping at the first p < 0.05 inflates the false-positive rate well above 5% (with 14 looks it can be around 20 to 30%). Fixed-horizon p-values are only valid if the sample size is set in advance; otherwise use sequential methods (alpha spending, mSPRT) or a Bayesian approach.
- "Not significant" does not mean "no effect": the test may simply be **under-powered**.

**3. Design and recommendation**

- **Power analysis before the test:** to detect a 0.2 pp lift on a 4% baseline with 80% power at alpha 0.05 you need roughly `16 * p(1-p) / delta^2 = 16 * 0.0384 / 0.002^2` about **154,000 users per arm**, three times what was collected.
- Pre-register the primary metric, minimum detectable effect, duration (full weeks to cover weekly seasonality) and guardrail metrics (latency, revenue per user, complaint rate). Randomise by user; check sample ratio mismatch.
- Account for multiple metrics and segments (Bonferroni or false-discovery-rate control).

**Recommendation now:** do not claim a win. Either continue the test to the planned sample size (using a valid sequential design), or ship only if the downside is low and the +0.2 pp is worth the cost, framed as "likely small positive, uncertain". Report the effect size and confidence interval, not only the p-value, and consider statistical vs practical significance (what is 0.2 pp worth in revenue?).
