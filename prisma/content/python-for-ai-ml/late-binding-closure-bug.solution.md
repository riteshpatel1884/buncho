**Printed:** `[20, 20, 20]`.

**Why.** Closures capture the **variable** `i`, not its value at creation time. Python looks `i` up when the lambda is *called*, and by then the loop has finished with `i == 2`. This is called late binding.

**Fixes**

```python
# 1. Bind the current value as a default argument
scalers = [lambda x, i=i: x * i for i in range(3)]

# 2. functools.partial binds the value immediately
from functools import partial
from operator import mul
scalers = [partial(mul, i) for i in range(3)]

# 3. A factory function creates a new scope per call
def make_scaler(i):
    return lambda x: x * i
scalers = [make_scaler(i) for i in range(3)]
```

Each gives `[0, 10, 20]`.

**Where it bites in real code:** callbacks registered in a loop (hooks on each layer, button handlers, scheduled jobs, tool functions generated per name). Default-argument binding has a side effect: callers can accidentally override it, so a factory or `partial` is cleaner for public APIs.
