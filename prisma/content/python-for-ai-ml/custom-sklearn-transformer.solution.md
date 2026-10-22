```python
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.utils.validation import check_is_fitted

class ClipLog(BaseEstimator, TransformerMixin):
    def __init__(self, upper_q=0.99):
        self.upper_q = upper_q                 # store parameters only, no logic

    def fit(self, X, y=None):
        X = np.asarray(X, dtype=float)
        self.upper_ = np.quantile(X, self.upper_q, axis=0)   # learned: trailing underscore
        return self                            # fit must return self

    def transform(self, X):
        check_is_fitted(self)
        X = np.asarray(X, dtype=float)
        return np.log1p(np.clip(X, 0, self.upper_))          # does not modify X in place
```

**Conventions**
1. `__init__` takes hyperparameters as keyword arguments with defaults and **only assigns them to attributes of the same name**. `BaseEstimator.get_params/set_params` and `clone` rely on this; validation belongs in `fit`.
2. Anything **learned from data** is set in `fit` and ends with an underscore (`upper_`). This is what `check_is_fitted` inspects.
3. `fit(X, y=None)` returns `self`; `transform` returns a new array and never mutates the input.
4. `TransformerMixin` gives `fit_transform` for free. Add `get_feature_names_out` when you need names downstream.
5. The quantile is computed **only on training folds** when used inside a Pipeline with cross-validation, which prevents leakage.

**Duck typing.** scikit-learn does not require inheritance. Anything with the right methods (`fit`, `transform`, `get_params`...) works. The base classes are a convenience that provide the boilerplate.
