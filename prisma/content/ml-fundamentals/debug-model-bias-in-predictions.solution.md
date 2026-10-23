**1. Measure**

Compute metrics **per group**, not only overall: selection rate, true-positive rate, false-positive rate, calibration. Common criteria: demographic parity (equal selection rates), equal opportunity (equal TPR), equalised odds. They can conflict, so pick the one that matches the harm you care about.

```python
from fairlearn.metrics import MetricFrame, selection_rate, true_positive_rate
mf = MetricFrame(metrics={"sel": selection_rate, "tpr": true_positive_rate},
                 y_true=y_te, y_pred=pred, sensitive_features=group_te)
print(mf.by_group, mf.difference())
```

**2. Find the source**

- **Sampling bias:** a group is under-represented.
- **Label bias:** historical decisions were themselves biased.
- **Proxy features:** postcode, school or name correlates with the protected attribute even if it is removed.
- **Measurement bias:** features are noisier for one group.
- **Threshold/objective:** one global threshold hurts a group with a different score distribution.

**3. Mitigate (pick by where the problem is)**

| Stage | Action |
|---|---|
| Data | Collect more data, re-sample or re-weight, fix labels, drop or transform proxy features |
| Training | Fairness-constrained learning (`fairlearn.reductions.ExponentiatedGradient`) |
| Post-processing | Group-specific thresholds (`ThresholdOptimizer`) |

**4. Govern**

Document the trade-off between accuracy and fairness, keep human review for borderline cases, monitor fairness metrics in production, and check legal requirements. Removing the protected column alone is **not** enough.
