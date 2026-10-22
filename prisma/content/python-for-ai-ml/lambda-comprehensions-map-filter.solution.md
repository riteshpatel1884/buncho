- `lambda` creates a small **anonymous function** limited to a single expression.
- `map(f, xs)` and `filter(f, xs)` return **lazy iterators** in Python 3 (not lists).
- A **list comprehension** builds a list; a **generator expression** `( ... )` is the lazy version.

```python
doubled_evens = [x * 2 for x in nums if x % 2 == 0]      # preferred: one readable pass
doubled_evens_lazy = (x * 2 for x in nums if x % 2 == 0) # lazy, constant memory
```

**Recommendation.** Comprehensions are usually clearer and often faster than `map`/`filter` with a lambda, because the function-call overhead is avoided. Use `map(func, xs)` when you already have a **named function** (`map(str.strip, lines)`).

**Where lambdas shine**
- Sort keys: `sorted(docs, key=lambda d: d["score"], reverse=True)`.
- Small callbacks: `df.groupby("user").apply(lambda g: ...)`, `defaultdict(lambda: 0.0)`.
- `max(models, key=lambda m: m.val_auc)`.

**Cautions**
- Do not assign lambdas to names (`f = lambda ...`); write a `def` so it gets a proper name in tracebacks.
- Lambdas capture variables by reference (late binding), see the closure debugging question.
- `functools.reduce` exists but a loop, `sum`, `math.prod` or `itertools.accumulate` is usually clearer.
