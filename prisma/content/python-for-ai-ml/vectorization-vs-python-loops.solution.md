**Vectorisation** means expressing a computation as operations on whole arrays so the loop runs in compiled C/Fortran code instead of the Python interpreter.

**Why it is faster**
1. **No per-element interpreter overhead:** a Python loop pays for bytecode dispatch, type checks and boxing a new `int`/`float` object on every iteration.
2. **Contiguous, typed memory:** NumPy stores raw `float32`/`float64` values side by side, which is cache-friendly.
3. **SIMD and optimised BLAS:** matrix operations use CPU vector instructions and multi-threaded libraries.

```python
# slow: ~100x slower on large arrays
total = 0.0
for i in range(len(x)):
    total += (x[i] - mu) ** 2

# fast
total = ((x - mu) ** 2).sum()      # or np.dot(x - mu, x - mu)
```

**Misconceptions**
- `np.vectorize` is a convenience wrapper around a Python loop, **not** a speedup.
- `df.apply(axis=1)` and `.iterrows()` are Python loops in disguise. Prefer column operations, `np.where`, `str` accessors or `merge`.

**When you cannot vectorise** (state depends on the previous step, branching logic, variable-length structures): use Numba `@njit`, Cython, a Rust/C++ extension, or restructure the algorithm (cumulative sums, sorting, grouping). Also remember vectorising may use more memory because of intermediate arrays, so batch the work if needed.
