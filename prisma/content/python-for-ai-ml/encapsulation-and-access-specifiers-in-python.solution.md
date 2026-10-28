**No enforced access control.** Python relies on convention ("we are all consenting adults").

| Form | Meaning |
|---|---|
| `name` | public |
| `_name` | internal: "do not touch from outside" (convention only) |
| `__name` | **name-mangled** to `_ClassName__name` to avoid clashes in subclasses; not real privacy |

```python
class Threshold:
    def __init__(self, value: float):
        self._value = 0.0
        self.value = value                 # goes through the setter below

    @property
    def value(self) -> float:              # read access
        return self._value

    @value.setter
    def value(self, v: float) -> None:     # validation on every assignment
        if not 0.0 <= v <= 1.0:
            raise ValueError("threshold must be in [0, 1]")
        self._value = v


t = Threshold(0.3)
t.value = 0.9
try:
    t.value = 5
except ValueError as e:
    print(e)

class Secret:
    def __init__(self):
        self.__token = "abc"               # stored as _Secret__token

assert Secret()._Secret__token == "abc"    # still reachable
```

**Encapsulation in practice:** keep state private by convention, expose a small public API, and use `@property` for validation or computed values instead of Java-style getters and setters. If you need real security (an API key), do not store it in an object and rely on underscores. Keep it out of the code and logs.

**Related tools:** `__slots__` restricts which attributes an object can have, `@dataclass(frozen=True)` makes instances immutable, and Pydantic validates fields on creation.
