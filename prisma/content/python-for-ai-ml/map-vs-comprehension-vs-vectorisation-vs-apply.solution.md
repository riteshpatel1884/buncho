**`map(func, iterable)`** applies a function to every item and returns a **lazy iterator** in Python 3 (a list in Python 2). It produces values only as you consume them, so wrap it in `list()` to materialise.

```python
import timeit

import numpy as np
import pandas as pd

xs = list(range(100_000))

m = map(lambda x: x * 2, xs)
assert not isinstance(m, list)                        # lazy iterator
assert list(m)[:3] == [0, 2, 4]

via_map = list(map(lambda x: x * 2, xs))
via_comp = [x * 2 for x in xs]
arr = np.arange(100_000)
via_np = arr * 2                                      # vectorised: the loop runs in C
assert via_map == via_comp == via_np.tolist()

df = pd.DataFrame({"a": xs})
via_apply = df["a"].apply(lambda x: x * 2)            # Python function called once per row
via_vec = df["a"] * 2                                 # vectorised column operation
assert via_apply.equals(via_vec)

# Dictionary lookup: Series.map is the right tool.
codes = pd.Series(["a", "b", "a"]).map({"a": 0, "b": 1})
assert codes.tolist() == [0, 1, 0]

for name, fn in {
    "comprehension": lambda: [x * 2 for x in xs],
    "map + lambda": lambda: list(map(lambda x: x * 2, xs)),
    "numpy": lambda: arr * 2,
    "pandas apply": lambda: df["a"].apply(lambda x: x * 2),
    "pandas vectorised": lambda: df["a"] * 2,
}.items():
    print(f"{name:18s}{timeit.timeit(fn, number=5) / 5 * 1000:8.2f} ms")   # measure on your machine
```

| Approach | Where the loop runs | Use when |
|---|---|---|
| `map(f, xs)` | Python (lazy) | You already have a named function, or you want a lazy stream |
| List comprehension | Python | Readable transform or filter on plain lists; usually as fast as or faster than `map` with a `lambda` |
| NumPy / pandas **vectorised** | **C** | Numeric work on arrays and columns. **The default for ML data**, typically orders of magnitude faster |
| `DataFrame.apply` / `Series.apply` | Python, once per row or item | Logic that cannot be vectorised; it is a loop in disguise, so avoid it on large data |
| `Series.map(dict)` | Optimised lookup | Recoding values through a mapping |

**Guidance:** vectorise first. If you cannot, use a comprehension. Use `map` with a built-in or named function (`map(str.strip, lines)`), not a `lambda`. For heavy row-wise logic, reach for `numba`, `np.where`/`np.select`, or `multiprocessing`. Always measure on your own data instead of trusting rules of thumb.
