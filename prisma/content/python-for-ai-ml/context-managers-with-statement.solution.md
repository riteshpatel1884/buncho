`with` guarantees that setup and cleanup run as a pair, **even if an exception occurs**. An object works with `with` if it implements `__enter__` and `__exit__(exc_type, exc, tb)`.

```python
import time
from contextlib import contextmanager

# 1. Class-based
class Timer:
    def __enter__(self):
        self.t0 = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc, tb):
        self.elapsed = time.perf_counter() - self.t0
        return False            # False/None: re-raise exceptions. True would suppress them.

# 2. Generator-based (shorter)
@contextmanager
def timer(label):
    t0 = time.perf_counter()
    try:
        yield
    finally:                    # runs even when the body raises
        print(f"{label}: {time.perf_counter() - t0:.2f}s")
```

**Where they appear in ML code**
- `with open(...)`, DB connections, locks (`with lock:`), temp directories.
- `with torch.no_grad():` / `torch.inference_mode()`: switch off gradient tracking and restore the previous state afterwards.
- `with torch.autocast("cuda"):` mixed precision.
- `with mlflow.start_run():`, `with tracer.start_as_current_span(...)` for experiment tracking and tracing.
- `with ThreadPoolExecutor() as ex:` waits for tasks and shuts down.

**Gotchas:** returning `True` from `__exit__` swallows exceptions silently, so do it deliberately. In a generator-based manager, wrap `yield` in `try/finally` or the cleanup will not run on error.
