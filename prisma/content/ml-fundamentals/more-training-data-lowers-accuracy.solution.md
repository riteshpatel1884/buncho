More data helps on average **if it is clean and comes from the same distribution**. When accuracy drops, suspect the data or the setup, not the principle.

**Likely causes**

1. **Noisy or mislabelled data:** the new rows have lower label quality. Check label agreement and a manual sample.
2. **Distribution shift:** the new data comes from a different source, period or population than the validation set. Compare feature distributions (train-old, train-new, validation).
3. **Duplicates or leakage changes:** the validation set was previously close to the old training data; the new data changes what counts as "similar".
4. **Class balance changed:** new data is dominated by one class, shifting priors.
5. **Model capacity/hyperparameters no longer fit:** more data may need a bigger model, different learning rate or more epochs. Training for the same number of steps with more data is effectively less training per sample.
6. **Pipeline bugs:** inconsistent preprocessing for the new files (different scaling, encoding, columns).
7. **Natural variance:** a single run on one validation split is noisy; repeat with several seeds or cross-validation.

**Diagnostics**

```python
# learning curve: does validation score rise with more data?
from sklearn.model_selection import learning_curve
sizes, tr, va = learning_curve(model, X, y, train_sizes=[0.2, 0.4, 0.6, 0.8, 1.0], cv=5)
```

Train on old-only, new-only and combined, and evaluate each on a fixed validation set to isolate the problem. Fix quality first (clean labels, deduplicate, align preprocessing), then retune.

**Takeaway:** more data is not automatically better; **better, representative data** is.
