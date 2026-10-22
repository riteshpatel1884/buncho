Write a custom transformer that clips each feature at a percentile learned from the training data and applies `log1p`.

- Which conventions must it follow so that `Pipeline`, `clone` and `GridSearchCV` work?
- Why is this an example of duck typing?
