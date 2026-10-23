**Output**

```text
['a']
['a', 'b']        # surprise: 'a' is still there
['x', 'c']
['a', 'b', 'd']   # the shared default list keeps growing
```

**Why:** default argument expressions are evaluated **once, when the `def` statement runs**, not on each call. The empty list is created once and stored on the function object (`add_tag.__defaults__`). Every call that omits `tags` mutates that same list.

**Fix: use `None` as a sentinel**

```python
def add_tag(tag, tags=None):
    if tags is None:
        tags = []
    tags.append(tag)
    return tags
```

(Or avoid mutation: `return [*(tags or []), tag]`.)

**ML example**

```python
def train(model, data, history=[]):        # BUG
    for epoch in range(3):
        history.append(evaluate(model, data))
    return history

h1 = train(model_a, data)    # 3 entries
h2 = train(model_b, data)    # 6 entries: model_a's metrics are mixed into model_b's history
```

Plotting `h2` or picking the "best epoch" would silently use the wrong model's numbers. Typical places: collecting metrics, caching results in a dict (`cache={}`), accumulating predictions or config options.

**Rules of thumb:** never use a mutable object (`list`, `dict`, `set`, a model instance) as a default value; immutable defaults (`None`, numbers, strings, tuples) are safe. Linters such as `ruff` (B006) and pylint flag this. The same shared-object behaviour is why `@dataclass` requires `field(default_factory=list)`.
