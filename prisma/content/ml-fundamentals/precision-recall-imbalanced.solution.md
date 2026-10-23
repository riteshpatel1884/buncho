**1. Accuracy is misleading.** Always predicting "not fraud" is right on 998,000 of 1,000,000 transactions, so it scores **99.8%** while catching zero fraud. This model also scores 99.8%, so accuracy cannot tell them apart.

**2. Confusion matrix**

| | Predicted fraud | Predicted legit |
|---|---:|---:|
| Actual fraud (2,000) | TP = 1,500 | FN = 500 |
| Actual legit (998,000) | FP = 1,500 | TN = 996,500 |

- Precision = 1,500 / 3,000 = **50%** (half of the alerts are real)
- Recall = 1,500 / 2,000 = **75%** (a quarter of fraud is missed)
- F1 = 2 x 0.5 x 0.75 / 1.25 = **0.60**

```python
from sklearn.metrics import precision_recall_fscore_support, average_precision_score
p, r, f, _ = precision_recall_fscore_support(y_true, y_pred, average="binary")
ap = average_precision_score(y_true, scores)    # threshold-free, suited to imbalance
```

**3. Choosing metrics and threshold**

- Use **precision-recall curves and average precision (PR-AUC)**, not accuracy or ROC-AUC alone: ROC-AUC looks good because true negatives dominate.
- Turn the threshold into a **cost problem**. A missed fraud (FN) costs the fraud amount plus chargeback fees; a false alert (FP) costs analyst time or a declined good customer. Pick the threshold that minimises expected cost, or maximises recall subject to a review capacity (for example "analysts can review 3,000 alerts a month").
- Report precision@k or recall at a fixed alert budget.
- Evaluate with a **time-based split** (train on earlier months, test on later), stratify folds, and use class weights or resampling during training rather than changing the test set.
- Monitor precision, recall and alert volume after launch; fraud patterns drift and attackers adapt.
