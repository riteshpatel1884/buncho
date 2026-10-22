**Rules.** Align shapes on the **right**; prepend 1s to the shorter shape. Two dimensions are compatible if they are **equal or one of them is 1**. A size-1 dimension is virtually stretched to match (no data copy for the stretch itself). Otherwise NumPy raises `ValueError`.

1. `(5, 3) - (3,)` works. `(3,)` becomes `(1, 3)`, result `(5, 3)`. This is how you subtract the per-feature mean: `X - X.mean(axis=0)`.
2. `(5, 3) - (5,)` fails: trailing dims are 3 vs 5. Fix by adding an axis: `X - v[:, None]` where `v` has shape `(5,)`, which becomes `(5, 1)`. This is per-row normalisation: `X / X.sum(axis=1, keepdims=True)`.
3. `(3, 1) + (1, 4)` gives `(3, 4)`, an outer-sum.

```python
import numpy as np
X = np.random.rand(5, 3)
Z = (X - X.mean(0)) / X.std(0)                      # standardise columns
row_norm = X / np.linalg.norm(X, axis=1, keepdims=True)
```

**Hidden costs**
- Intermediate results can be huge. Pairwise distances via `X[:, None, :] - Y[None, :, :]` create an `(n, m, d)` array. Use the expansion `||x||² - 2x·y + ||y||²` with a matrix multiply instead.
- Accidental broadcasting is a classic silent bug: `(n,)` minus `(n, 1)` gives `(n, n)`, not an error. This is common with losses and labels of shape `(n,)` vs `(n, 1)`.
- Prefer `keepdims=True` and explicit `[:, None]` for readability and safety.
