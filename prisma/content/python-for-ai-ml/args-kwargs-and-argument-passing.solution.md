**In a definition**, they collect extras: `*args` becomes a **tuple** of extra positional arguments; `**kwargs` becomes a **dict** of extra keyword arguments.

**In a call**, they unpack: `f(*[1, 2], **{"lr": 1e-3})` is `f(1, 2, lr=1e-3)`.

```python
def train(model, data, *, lr=1e-3, epochs=10):   # * makes lr, epochs keyword-only
    ...

def f(a, b, /, c):                               # / makes a, b positional-only
    ...

def build_optimizer(name, params, **opt_kwargs):
    cls = {"adam": torch.optim.Adam, "sgd": torch.optim.SGD}[name]
    return cls(params, **opt_kwargs)             # forwards lr, weight_decay, momentum...
```

**Practical uses**
- Wrappers and decorators that forward arguments unchanged: `def wrapper(*args, **kwargs): return fn(*args, **kwargs)`.
- Config-driven construction (`Model(**cfg["model"])`), passing options through to a library.
- Keyword-only arguments make calls self-documenting and let you add parameters safely: `train(model, data, lr=3e-4)`.
- `functools.partial` pre-fills arguments.

**Risks of overuse**
- Typos are swallowed silently: `Model(**{"learnnig_rate": 1e-3})` fails only if the callee does not accept `**kwargs`, so if everything forwards `**kwargs`, a misspelled option may be ignored or fail far from its cause.
- Signatures become opaque to IDEs, type checkers and tools like FastAPI.
- Prefer explicit parameters for the main API and reserve `**kwargs` for genuine pass-through.
