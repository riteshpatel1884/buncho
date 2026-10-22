**LEGB lookup order:** **L**ocal, **E**nclosing (outer functions), **G**lobal (module), **B**uilt-ins.

**Closure.** An inner function that remembers variables from its enclosing function, even after the outer function has returned.

```python
def make_counter():
    n = 0
    def inc():
        nonlocal n          # rebind the enclosing variable
        n += 1
        return n
    return inc

c = make_counter()
c(), c()                    # 1, 2
```

Decorators work because the wrapper closes over the decorated function (`fn`) and any decorator arguments.

**The snippet** raises `UnboundLocalError`. Because `count += 1` *assigns* to `count`, Python treats `count` as **local** to `inc` for the whole function body, then finds it unassigned when reading it. Fixes:
- `global count` (works but global mutable state is hard to test), or
- pass state in and return the new value (preferred), or
- use a class or `itertools.count`.

**Notes**
- *Reading* an outer variable needs no declaration; only *rebinding* does. Mutating an outer list (`items.append(x)`) works without `nonlocal`.
- Closures capture **variables, not values**. If the variable changes later (a loop variable), the closure sees the new value, which is the late-binding gotcha.
- Comprehension variables have their own scope in Python 3, so they do not leak.
