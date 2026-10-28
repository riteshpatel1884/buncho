```python
class ModelWrapper:
    registry = []                      # class attribute: shared by all instances

    def __init__(self, name: str, threshold: float = 0.5):
        self.name = name               # instance attributes: one set per object
        self.threshold = threshold
        ModelWrapper.registry.append(name)

    def predict(self, score: float) -> int:
        return int(score >= self.threshold)


m = ModelWrapper("spam-filter", threshold=0.7)
assert m.predict(0.8) == 1
assert ModelWrapper.predict(m, 0.4) == 0   # exactly what m.predict(0.4) does
assert ModelWrapper.registry == ["spam-filter"]
```

**`self`** is the instance. When you call `m.predict(0.8)`, Python rewrites it to `ModelWrapper.predict(m, 0.8)`, so the first parameter receives the object. The name `self` is only a convention.

**`__init__`** is the **initialiser**. It runs right after the object is created (by `__new__`) and sets its starting state. It returns `None`.

**Class vs instance attributes:** a class attribute is shared. A **mutable** class attribute (a list or dict) is shared by every instance, which is a common bug. Put mutable state in `__init__`.

**Empty class and `object()`**

```python
class Placeholder:
    pass                               # valid body for "do nothing"

o = object()                           # the plain base type of every class
# o.x = 1 would fail: bare object() has no __dict__
```

Every class inherits from `object`. Use an empty class when you only need a namespace or a marker. Use a `dataclass` when you want a simple record.
