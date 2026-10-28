**Python list** (dynamic array of object references)

```python
a = [1, 2, 3]
a.append(4)         # O(1) amortised
a.extend([5, 6])    # O(k)
a.insert(0, 0)      # O(n): shifts every element
a.pop()             # O(1) remove last
a.pop(0)            # O(n)
a.remove(3)         # O(n): finds the first match, then shifts
del a[1]            # O(n)
```

For fast removal from the front, use `collections.deque` (O(1) at both ends).

**`array.array`** is a typed, compact array. It supports the same `append`, `extend`, `insert`, `pop` and `remove`. It stores raw numbers (no per-item objects), so it uses less memory than a list but is far less capable than NumPy.

**NumPy arrays have a fixed size.** `np.append`, `np.insert` and `np.delete` return a **new array** and copy everything, so each call is O(n).

```python
import numpy as np

x = np.array([1, 2, 3])
x = np.append(x, 4)          # new array
x = np.delete(x, 1)          # new array without index 1
x = np.insert(x, 0, 99)      # new array
mask = x != 99
x = x[mask]                  # boolean filtering is the idiomatic "remove"
```

**The classic bug**

```python
import numpy as np

source, f = range(1000), float

# Slow: O(n^2). Copies the whole array on every iteration.
out = np.array([])
for v in source:
    out = np.append(out, f(v))

# Fast: collect in a list, convert once.
out = np.array([f(v) for v in source])
```

When the size is known, **preallocate** with `np.empty(n)` and fill by index. Prefer vectorised operations over any loop.
