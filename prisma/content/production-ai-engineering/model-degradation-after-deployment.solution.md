**Principle:** rule out boring, fixable causes first (data pipeline bugs), then look at drift, and only then retrain.

**1. Read the evidence**

- `merchant_category` null rate jumped from 0.4% to 23%, and this coincides with the warehouse migration: a **data pipeline or schema problem** (broken join, renamed column, changed default). The model sees many missing values it was not trained on, and the flagged share dropped from 8% to 3% because scores shifted.
- `days_since_last_login` rose from 11 to 17: could be **real behaviour change** (seasonality, new pricing plans) or a logging change in the new pipeline.
- AUC falls, but labels are 45 days late, so **AUC lags reality**: week-12 AUC reflects predictions from about week 5, so the cause may have begun earlier than the label metric shows.

**2. Triage order**

1. **Pipeline integrity:** compare feature distributions and null rates between training data and live data, per feature; check schema, units, joins, timezone, encoding and default values. Compare a sample of features computed by the old and new pipelines for the same customers.
2. **Training-serving skew:** is the same transformation code used online and offline?
3. **Data drift:** population stability index (PSI) or KS tests per feature; look at the segments with biggest shifts.
4. **Concept drift:** relationship between features and churn changed (new pricing plans changed why people leave). Evidence: stable inputs but falling performance on matured labels.
5. **Label or metric issues:** definition of churn changed, delayed labels, selection bias (retention team only acts on top-risk customers, which alters outcomes: feedback loop).
6. **Seasonality:** compare with the same period last year.

```python
import numpy as np
def psi(expected, actual, bins=10):
    cuts = np.quantile(expected, np.linspace(0, 1, bins + 1)); cuts[0], cuts[-1] = -np.inf, np.inf
    e = np.histogram(expected, cuts)[0] / len(expected) + 1e-6
    a = np.histogram(actual, cuts)[0] / len(actual) + 1e-6
    return float(((a - e) * np.log(a / e)).sum())      # > 0.25 means a major shift
```

**3. Actions**

- **Immediate:** fix the pipeline (restore `merchant_category`), backfill the affected features, re-score, and add a null-rate guard that blocks bad data.
- Add **monitoring without labels**: feature null rates, PSI, score distribution, share flagged, alerts with thresholds. Use **proxy metrics** (early churn signals) while true labels are delayed.
- If drift remains after the fix: **retrain** on recent data (including the new plans), validate on a time-based holdout, shadow-deploy and A/B test before replacing.
- Schedule periodic retraining and keep a champion/challenger setup; version datasets, features and models.
- Add data contracts and migration checklists so pipeline changes require validation against the model's expected inputs.

**Outcome statement:** most likely a combination: a data bug from the migration plus real drift from pricing changes. Fixing the bug first prevents retraining on corrupted data.
