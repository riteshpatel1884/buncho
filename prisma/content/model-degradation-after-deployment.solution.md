## Investigate in order of likelihood

**1. Rule out bugs first.** These are common and cheap to check.
- Did an upstream schema, unit, or encoding change? Are null rates or default values different?
- **Training-serving skew**: are features computed the same way online as in training?
- Did a dependency, feature store job or model version change?

**2. Check data drift.** Compare current feature distributions with the training data. Useful measures are the Population Stability Index (PSI), the KS test, or a simple comparison of means and quantiles.

$$
\text{PSI} = \sum_i (p_i - q_i)\,\ln\frac{p_i}{q_i}
$$

A common rule of thumb treats PSI above about 0.1 as a shift worth examining and above 0.25 as a large shift. These are heuristics, not guarantees.

**3. Check concept drift.** Even if inputs look the same, the relationship between inputs and churn may have changed (a price change, a competitor, seasonality). Evaluate on recent data that has labels, segment by cohort, and look for where performance dropped.

**4. Check the feedback loop.** If the retention team acts on predictions, the intervention changes the outcomes the model later learns from.

## Monitoring when labels arrive late

- Monitor **inputs**: feature distributions, missing rates, ranges.
- Monitor **outputs**: score distribution and the share predicted above the threshold.
- Track **delayed performance** (AUC, precision at the capacity the team can handle) once labels arrive.
- Use proxy metrics such as retention-offer acceptance.
- Alert on thresholds, and tie each alert to a runbook.

## Remediation

Fix the pipeline if it is a bug. Otherwise retrain on recent data (a rolling window or time-weighted samples), validate against a time-based holdout, and roll out through shadow mode or a canary before full release. Decide a retraining cadence from the drift you observe rather than a fixed calendar alone.
