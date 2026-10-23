**1. Clarify the need**

- **Global:** which features matter overall? (regulator, model review)
- **Local:** why was *this* applicant declined? (customer, case worker)
- Required accuracy vs interpretability trade-off: if a logistic regression or small tree is nearly as good, use it, because it is explainable by construction.

**2. Choose techniques**

| Need | Tool |
|---|---|
| Inherently interpretable model | Linear/logistic regression, GAM/EBM, shallow tree |
| Global importance | Permutation importance, SHAP summary, partial dependence |
| Local explanation | SHAP values, LIME, counterfactuals ("income +5k would be approved") |
| Deep/NLP models | Integrated gradients, attention is *not* a reliable explanation by itself |

**3. Example with SHAP**

```python
import shap, xgboost as xgb

model = xgb.XGBClassifier().fit(X_train, y_train)
explainer = shap.TreeExplainer(model)
sv = explainer(X_test)

shap.plots.beeswarm(sv)          # global view
shap.plots.waterfall(sv[0])      # why this one applicant got this score
```

**4. Make it usable**

- Translate top contributing features into plain-language reason codes.
- Store the explanation with each prediction for audit.
- Validate explanations: stability, sanity checks, domain-expert review.
- Remember explanations describe the *model*, not causality.

**5. Governance:** model card, versioning, monitoring, and human review for contested decisions.
