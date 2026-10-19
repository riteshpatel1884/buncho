## What p = 0.03 means

The p-value is the probability of seeing a difference **at least this large** if the null hypothesis (no true difference) were true and the test assumptions hold. It is a statement about the data given the null.

It is **not**:
- the probability that the treatment is better, or that the null is true;
- the size or importance of the effect;
- a guarantee the result will replicate.

## Is it practically significant?

A 0.4 percentage point lift is a **4% relative** increase. Look at the **confidence interval** for the difference, not only the p-value, and ask whether the whole range is worth the cost of shipping and maintaining the change.

## Checks before shipping

1. **Pre-registered design**: sample size from a power calculation, and one primary metric defined in advance.
2. **No peeking**: checking daily and stopping when p < 0.05 inflates false positives. Use a fixed horizon or a sequential testing method designed for it.
3. **Multiple comparisons**: many metrics or segments raise the chance of a spurious win. Correct for it (for example Bonferroni or false discovery rate) or treat extra findings as exploratory.
4. **Sample ratio mismatch**: if the observed split differs from the planned split, assignment or logging may be broken.
5. **Guardrail metrics**: latency, revenue per user, long-term retention, and complaints should not regress.
6. **Novelty and seasonality**: run through at least a full weekly cycle, and check the effect does not fade.
7. **Independence**: if users appear multiple times, randomise by user, not by session.

## A good conclusion

"The effect is statistically significant and the estimated lift is about 4% relative with a confidence interval of X to Y. Guardrails look healthy, so I would ship, ideally with a holdout to confirm the effect over time." State the interval from the actual data rather than guessing it.
