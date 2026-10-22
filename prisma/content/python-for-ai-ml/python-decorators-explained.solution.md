A decorator is a callable that takes a function (or class) and returns a replacement. This:

```python
@timed
def train(): ...
```

is exactly `train = timed(train)`.

```python
import functools, time

def timed(fn):
    @functools.wraps(fn)                 # keeps __name__, __doc__, signature info
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        try:
            return fn(*args, **kwargs)
        finally:
            print(f"{fn.__name__}: {time.perf_counter() - start:.2f}s")
    return wrapper
```

**With arguments**, add one more layer: a decorator *factory* returns the real decorator.

```python
def retry(times=3):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*a, **kw):
            for i in range(times):
                try:
                    return fn(*a, **kw)
                except Exception:
                    if i == times - 1:
                        raise
        return wrapper
    return decorator
```

**Common uses in ML/AI code**
- `@torch.no_grad()` / `@torch.inference_mode()`: disable autograd for inference functions.
- `@functools.lru_cache`: memoise pure functions (tokenizer lookups, embeddings of repeated text).
- `@tf.function`, `@torch.compile`: compile a function.
- `@property`, `@staticmethod`, `@classmethod`, `@dataclass`.
- Custom: retries for LLM APIs, timing, logging, rate limiting, tool registration for agents (`@tool`).

**Pitfalls:** forgetting `functools.wraps` breaks introspection and tools that read signatures (FastAPI, agent frameworks); stacking order matters (the decorator closest to the function applies first).
