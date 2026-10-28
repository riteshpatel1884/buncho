**Negative index:** `a[-k]` means `a[len(a) - k]`, so `a[-1]` is the last element. It raises `IndexError` if `k > len(a)`.

**Slice:** `a[start:stop:step]` takes items from `start` up to but **not including** `stop`. Any part can be omitted, and slices never raise `IndexError`; they clip.

```python
a = [10, 20, 30, 40, 50]
assert a[-1] == 50 and a[-2] == 40
assert a[1:4] == [20, 30, 40]
assert a[:2] == [10, 20] and a[3:] == [40, 50]
assert a[::2] == [10, 30, 50]            # every second item
assert a[::-1] == [50, 40, 30, 20, 10]   # step -1: reverse
assert a[-3:] == [30, 40, 50]            # last three
assert a[10:] == []                      # out of range slice is empty, no error
```

**`[::-1]`** walks the sequence from the end to the start, so it returns a **reversed copy** (for lists and strings). `reversed(a)` or `a.reverse()` avoid the copy.

**Copy or view?**

- List, string, tuple slices create a **new object** (shallow for lists).
- **NumPy** slices are **views** that share memory with the original, so writing to the slice changes the original.

```python
import numpy as np

x = np.arange(6)
view = x[1:4]
view[0] = 99
assert x[1] == 99               # the original changed
copy = x[1:4].copy()            # explicit copy when you need independence
```

**In ML code**

- `ids[-1]` is the last token and `logits[:, -1, :]` is the last position's logits.
- `x[:, :-1]` and `x[:, -1]` split features from a label column.
- `batch[::2]` subsamples, and `seq[::-1]` reverses a sequence for a backward RNN.
