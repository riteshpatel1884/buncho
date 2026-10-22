1. **`is`** compares **identity** (same object in memory, `id(a) == id(b)`). **`==`** calls `__eq__` and compares **value**. Do not use `is` for numbers or strings: small-int and string interning make `a is b` sometimes `True` as a CPython implementation detail.

2. `x is None` cannot be overridden and is always correct. `==` can be customised: with NumPy, `arr == None` is element-wise and returns an array, and `if arr == None:` raises "truth value of an array is ambiguous". Also `np.nan == np.nan` is `False`.

3. Dict keys and set members must be **hashable**: their hash must not change during their lifetime, and equal objects must have equal hashes. Tuples of hashable items qualify; lists, dicts and sets are mutable, so they are unhashable (`TypeError`).

4. If you define `__eq__` without `__hash__`, Python sets `__hash__ = None`, making instances **unhashable**. They cannot go in sets or be dict keys. To fix it, define a consistent `__hash__` (based on the same fields as `__eq__`), or use `@dataclass(frozen=True)` which generates both.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Pair:
    user: int
    item: int

seen = {Pair(1, 2)}
Pair(1, 2) in seen        # True
```

**ML angle:** pandas and NumPy overload `==` for element-wise comparison, so use `.equals`, `np.array_equal` or `np.allclose` when you mean whole-array equality.
