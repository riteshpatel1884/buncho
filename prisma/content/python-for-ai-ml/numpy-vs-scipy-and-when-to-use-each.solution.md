**NumPy** provides the **n-dimensional array** (`ndarray`) and fast element-wise maths, linear algebra basics, random numbers and FFT.
**SciPy** is built **on top of NumPy** and adds scientific algorithms: optimisation, statistics, sparse matrices, signal processing, interpolation and special functions.

| Need | NumPy | SciPy |
|---|---|---|
| Arrays, broadcasting, `dot`, `mean`, `std` | yes | uses it |
| Sparse matrices | no | `scipy.sparse` |
| Statistical tests and distributions | basic | `scipy.stats` |
| Minimise a function, fit a curve | no | `scipy.optimize` |
| Pairwise distances | manual | `scipy.spatial.distance.cdist` |
| `softmax`, `expit` (sigmoid), `gammaln` | no | `scipy.special` |

```python
import numpy as np
from scipy import optimize, sparse, special, stats
from scipy.spatial.distance import cdist

# 1) Sparse matrix: a TF-IDF style matrix with 99.9% zeros stores only the non-zero entries.
dense = np.zeros((1000, 5000))
dense[0, 3] = 2.0
dense[10, 4000] = 1.5
m = sparse.csr_matrix(dense)
assert m.nnz == 2

# 2) Statistical test: is model B better than model A across 8 folds?
a = np.array([0.80, 0.82, 0.79, 0.81, 0.83, 0.80, 0.82, 0.81])
b = np.array([0.82, 0.84, 0.80, 0.83, 0.85, 0.81, 0.84, 0.83])
t, p = stats.ttest_rel(b, a)               # paired test, because folds are shared
assert p < 0.05

# 3) Optimisation and special functions.
res = optimize.minimize(lambda w: (w[0] - 3) ** 2 + (w[1] + 1) ** 2, x0=[0.0, 0.0])
assert np.allclose(res.x, [3, -1], atol=1e-3)
assert np.isclose(special.softmax([1.0, 2.0, 3.0]).sum(), 1.0)
assert cdist([[0, 0]], [[3, 4]])[0, 0] == 5.0
```

**Rule of thumb:** start with NumPy (and pandas for tables). Import SciPy when you need an algorithm you would otherwise implement yourself. In deep learning, PyTorch tensors replace NumPy arrays, but SciPy is still common for statistics, sparse data and classical ML helpers (scikit-learn itself depends on it).
