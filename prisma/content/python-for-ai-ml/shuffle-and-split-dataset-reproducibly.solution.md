```python
import random

import numpy as np

data = list(range(100))

# 1) In place: modifies `data`, returns None.
rng = random.Random(42)                 # a private generator, not the global one
rng.shuffle(data)

# 2) Same idea without mutating the input: take a permutation of indices.
np_rng = np.random.default_rng(42)
idx = np_rng.permutation(len(data))

n = len(data)
n_train, n_val = int(0.8 * n), int(0.1 * n)
train = data[:n_train]
val = data[n_train:n_train + n_val]
test = data[n_train + n_val:]

assert len(train) == 80 and len(val) == 10 and len(test) == 10
assert set(train).isdisjoint(val) and set(train).isdisjoint(test) and set(val).isdisjoint(test)

# Reproducible: the same seed gives the same order.
again = list(range(100))
random.Random(42).shuffle(again)
assert again == data
```

**Notes**

- `random.shuffle(x)` shuffles **in place** and returns `None`, so `x = random.shuffle(x)` is a classic bug. Use `random.sample(x, len(x))` for a shuffled copy.
- Prefer a **local** generator (`random.Random(seed)`, `np.random.default_rng(seed)`) over `random.seed()` / `np.random.seed()`, so libraries and threads cannot disturb your sequence.
- For labelled data, use `sklearn.model_selection.train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)` to keep class ratios.

**When a random split is wrong**

- **Grouped data** (several rows per user, patient or document): split by group (`GroupShuffleSplit`), or the same entity lands in train and test and inflates the score.
- **Time series or anything with drift:** split by time, never shuffle.
- **Near-duplicates:** deduplicate before splitting.
- Fit scalers and encoders on the training portion only.
