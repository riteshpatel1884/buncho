**Decomposition.** For squared error, expected test error at a point splits into

`Error = Bias^2 + Variance + Irreducible noise`

- **Bias:** error from wrong assumptions; the model is too simple to capture the real pattern (underfitting). Even with infinite data it would stay wrong.
- **Variance:** sensitivity to the particular training sample; the model fits noise, so retraining on another sample gives very different predictions (overfitting).
- **Irreducible error:** noise in the data that no model can remove.

**Trade-off.** More complexity (deeper trees, higher-degree polynomials, more parameters) lowers bias but raises variance. The best model sits at the complexity where the sum is smallest.

**Diagnosis**

| Symptom | Train error | Validation error | Gap | Diagnosis |
|---|---|---|---|---|
| Both high, close together | High | High | Small | **High bias** |
| Low train, high validation | Low | High | Large | **High variance** |
| Both low, close | Low | Low | Small | Good fit |

Learning curves help: with high bias the curves converge at a poor score and more data does not help; with high variance a gap remains and more data narrows it.

**Fixes**

- *High bias:* richer model, better features, less regularisation, train longer.
- *High variance:* more data, regularisation (L1/L2, dropout), simpler model, early stopping, bagging/ensembles, data augmentation.

```python
from sklearn.model_selection import learning_curve
sizes, tr, va = learning_curve(model, X, y, cv=5, train_sizes=[0.1, 0.3, 0.5, 0.8, 1.0])
print(tr.mean(1), va.mean(1))     # gap = variance, low level = bias
```

**Modern note:** very large neural networks can show "double descent" (test error falls again past the interpolation point), but the classical picture is still the right tool for diagnosing everyday models.
