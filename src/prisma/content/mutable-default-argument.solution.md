## Output

```
['age', 'income'] ['age', 'income']
```

Both variables refer to the **same list object**.

## Why

Python evaluates default argument expressions **once, when the function is defined**, not on each call. The `[]` is created a single time and stored on the function object. Every call that omits `features` mutates and returns that same list, so state leaks between calls.

## Fix

Use `None` as a sentinel and create a new list inside the function:

```python
def add_feature(name, features=None):
    if features is None:
        features = []
    features.append(name)
    return features
```

Or avoid mutation by returning a new list: `return [*(features or []), name]`.

## Where this bites in ML code

- Pipeline or config builders that quietly accumulate columns across runs.
- Dataclasses: a mutable default is rejected at class definition, so use `field(default_factory=list)`.
- Notebook re-runs that appear to "remember" earlier cells.

Immutable defaults (numbers, strings, tuples, `None`) are safe. The rule of thumb is: never use a mutable object as a default value.
