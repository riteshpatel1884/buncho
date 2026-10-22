```python
assert 0.1 + 0.2 == 0.3                      # fails

if score == float("nan"):                   # never true
    handle_missing()

import numpy as np
x = np.array([1.0, np.nan, 3.0])
print(x.max(), x.mean())                     # nan nan

df.groupby("segment")["amount"].mean()       # rows with a missing segment are not shown
```

Explain each surprise and the correct way to handle it.
