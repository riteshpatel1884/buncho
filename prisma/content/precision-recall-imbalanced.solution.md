## Why accuracy misleads

A model that predicts "not fraud" for every transaction is correct 99.5% of the time and catches **zero** fraud. Accuracy is dominated by the majority class when classes are imbalanced.

## Metrics that fit

From the confusion matrix (TP, FP, FN, TN):

$$
\text{Precision} = \frac{TP}{TP + FP}, \qquad
\text{Recall} = \frac{TP}{TP + FN}, \qquad
F_1 = \frac{2PR}{P + R}
$$

- **Recall**: what fraction of real fraud do we catch?
- **Precision**: of the transactions we flag, how many are really fraud? This drives review workload and customer friction.
- **PR curve and average precision** summarise the trade-off across thresholds. A random classifier's PR-AUC equals the prevalence (0.005 here), so improvement is easy to read.

## PR curve vs ROC curve

ROC-AUC uses the false positive rate, whose denominator is the huge number of negatives. A model can have a high ROC-AUC while still flooding reviewers with false alarms. With heavy imbalance, the PR curve is usually more informative about the minority class.

## Choosing the threshold

Do not default to 0.5. Choose it from business costs:

1. Estimate the cost of a missed fraud (FN) and of a false alarm (FP).
2. Pick the threshold that minimises expected cost, or maximises recall subject to a precision floor or review capacity.
3. Pick it on a validation set and report on a separate test set.

## Other practical points

- Use stratified splits, and split by time if fraud patterns evolve.
- Class weights, resampling, or focal loss can help training. Resampling changes predicted probabilities, so recalibrate if you need real probabilities.
- Monitor precision and recall by segment (merchant type, region), not only overall.
