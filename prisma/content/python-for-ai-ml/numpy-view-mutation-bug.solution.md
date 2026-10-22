**Problem 1: hidden mutation.** `X[:20]` is a **view** (basic slicing), and `-=` / `/=` are **in-place** operations. The function therefore overwrites the first 20 rows of `X`. The caller's data is silently corrupted, and anything else sharing that buffer changes too.

**Problem 2: integer arrays.** `batch /= ...` tries to store float results into an int array, giving `UFuncTypeError: Cannot cast ufunc 'divide' output from dtype('float64') to dtype('int64')`. In-place ops keep the original dtype.

**Safe version: out-of-place and dtype-aware**

```python
def standardize(batch, mean, std, eps=1e-8):
    batch = np.asarray(batch, dtype=np.float32)       # new array if dtype differs
    return (batch - mean) / (std + eps)               # creates a new array; input untouched
```

If you really need to avoid allocation in a hot path, document the in-place behaviour (name it `standardize_`) and call `.copy()` at the boundary.

**Problem 3: statistics source.** Computing the mean and std from the **validation batch itself** is wrong. The statistics must be computed on the **training set** and reused for validation, test and production inputs. Otherwise each batch is normalised differently and information from evaluation data leaks into preprocessing. Also guard against `std == 0` (constant features) with an epsilon.

```python
mean, std = X_train.mean(0), X_train.std(0)
X_val_std = standardize(X_val, mean, std)
```
