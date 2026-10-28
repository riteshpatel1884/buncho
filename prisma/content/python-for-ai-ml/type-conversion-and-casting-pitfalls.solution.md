**Explicit conversion** uses constructors: `int()`, `float()`, `str()`, `bool()`, `list()`, `set()`, `dict()`.
**Implicit conversion** happens in mixed arithmetic: `int + float` gives `float`, and `True + 1` is `2`. Python will **not** silently join `"3" + 3` and raises `TypeError`.

```python
assert int(3.9) == 3 and int(-3.9) == -3          # truncates toward zero, does not round
assert round(3.5) == 4 and round(2.5) == 2        # banker's rounding: ties go to even
assert int("42") == 42
try:
    int("3.9")                                     # ValueError: parse as float first
except ValueError:
    assert int(float("3.9")) == 3

assert bool("False") is True                       # any non-empty string is truthy
assert bool("") is False and bool(0.0) is False and bool([]) is False
assert list("abc") == ["a", "b", "c"]
assert set([1, 1, 2]) == {1, 2}                    # duplicates and order are lost
assert 0.1 + 0.2 != 0.3                            # binary floating point
```

**NumPy: silent wrap-around**

```python
import numpy as np

a = np.array([250, 260, 300])
b = a.astype(np.uint8)
assert b.tolist() == [250, 4, 44]                  # values wrapped modulo 256, no error
```

Casting a float array with `NaN` to an integer type gives undefined values. Check first.

**pandas: parse text safely**

```python
import pandas as pd

s = pd.Series(["1", "2", "oops", None])
nums = pd.to_numeric(s, errors="coerce")          # invalid values become NaN
assert nums.isna().sum() == 2
```

**Rules of thumb:** convert at the **boundary** (when reading data), validate there, then keep one dtype downstream. Use `Decimal` for money, `float32`/`float16` deliberately for model weights, and never compare floats with `==` (use `math.isclose` or `np.isclose`).
