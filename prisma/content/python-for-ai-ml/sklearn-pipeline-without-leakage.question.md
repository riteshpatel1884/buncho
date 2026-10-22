A dataset has numeric columns `age`, `income` (with missing values) and categorical columns `city`, `plan` (with unseen categories at prediction time).

Build a single estimator that imputes, scales, one-hot encodes and fits a logistic regression, and evaluate it with 5-fold stratified cross-validation on an imbalanced target. Explain why a Pipeline matters.
