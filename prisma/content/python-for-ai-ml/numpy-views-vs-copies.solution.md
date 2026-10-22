A **view** is a new array object that shares the same data buffer; a **copy** owns its own memory.

**Usually views:** basic slicing (`a[1:5]`, `a[:, 0]`), `reshape` (when memory layout allows), `.T`, `transpose`, `ravel()` when contiguous, `np.asarray` on an array, `torch.from_numpy`.

**Always copies:** fancy (integer-array) indexing `a[[0, 2]]`, boolean masks `a[a > 0]`, `.copy()`, `flatten()`, `np.array(a)` (copies by default), `astype` (copies by default).

```python
import numpy as np
a = np.arange(10)
v = a[2:5];   v[0] = 99      # a[2] is now 99
c = a[[2, 3, 4]]; c[0] = -1  # a unchanged
np.shares_memory(a, v)       # True
v.base is a                  # True
```

**Why it matters**
- Normalising or augmenting a slice **in place** silently corrupts the original dataset (a train/validation leak).
- Memory: keeping a small slice alive keeps the whole big base array alive.
- Performance: views are free, copies cost time and memory. Avoid needless `.copy()` in hot loops, but use it when you must own the data.
- In-place ops (`+=`, `x[:] = ...`) on a view write through to the base.

**Habit:** if a function modifies its input, document it or make an explicit `copy()` first. Pandas has similar traps (SettingWithCopy), see the pandas question on `loc`/`iloc`.
