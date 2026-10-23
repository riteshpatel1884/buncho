| Stage | Goal | Practice and Python tools |
|---|---|---|
| Data | Representative, valid data | Check group balance with `pandas`; validate schemas with `pydantic`/`pandera`/`great_expectations` |
| Training | Fairness | `fairlearn`, `aif360`: compute metrics per group, apply mitigation (re-weighting, threshold tuning) |
| Evaluation | Honest performance | Report metrics per subgroup, not only overall; test on realistic data |
| Explanation | Transparency | `shap`, `lime`, feature importance, partial dependence |
| Documentation | Accountability | Model cards, data sheets, versioned datasets and models |
| Monitoring | Prevent harm over time | Drift and fairness dashboards (`evidently`), alerting, human review for high-risk decisions |
| LLMs | Safety | Guardrails, content filters, PII redaction, red-team test sets |

```python
from fairlearn.metrics import MetricFrame, selection_rate
from sklearn.metrics import accuracy_score, recall_score

mf = MetricFrame(
    metrics={"accuracy": accuracy_score, "recall": recall_score, "selection_rate": selection_rate},
    y_true=y_test, y_pred=y_pred, sensitive_features=A_test,
)
print(mf.by_group)          # per-group metrics
print(mf.difference())      # largest gap between groups
```

**Important caveat:** tools only measure; they do not make a system ethical. Decide which fairness definition fits the use case (they can conflict), involve domain experts, and keep humans in the loop for consequential decisions.
