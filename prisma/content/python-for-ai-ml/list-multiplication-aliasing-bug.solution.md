**Output**

```
[[1, 0, 0], [1, 0, 0], [1, 0, 0]]
[['x'], ['x'], ['x'], ['x']]
```

`[row] * 3` does not copy `row`; it repeats the **same reference** three times, so all rows are one list object. This is aliasing of a mutable object. The inner `[0] * 3` is fine because integers are immutable.

**Fix:** create a new inner list per row.

```python
grid = [[0] * 3 for _ in range(3)]
buckets = [[] for _ in range(4)]
# or: from collections import defaultdict; buckets = defaultdict(list)
```

**Related traps**
- `dict.fromkeys(keys, [])` shares one list among all keys. Use a dict comprehension: `{k: [] for k in keys}`.
- NumPy: `np.array([[0]*3]*3)` is safe because the array copies values on creation. The NumPy trap is views: `b = a[0]; b[:] = 5` modifies `a`. Use `.copy()` when you need independence.
- Default arguments (`def f(x, acc=[])`) have the same root cause: one shared mutable object.

**Diagnostic habit:** `id(grid[0]) == id(grid[1])` or `grid[0] is grid[1]` reveals aliasing instantly.
