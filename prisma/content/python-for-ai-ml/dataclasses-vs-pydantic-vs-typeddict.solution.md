| | Runtime validation | Mutable | Real class | Serialisation | Overhead |
|---|---|---|---|---|---|
| `@dataclass` | No | Yes (or `frozen=True`) | Yes | Manual (`asdict`) | Very low |
| `NamedTuple` | No | No | Tuple subclass | Tuple | Very low |
| `TypedDict` | No (static only) | Yes | **No, it is a dict** | It is already a dict | None |
| `BaseModel` | **Yes, with coercion** | Configurable | Yes | JSON and JSON Schema built in | Higher |

**Choices**
- **Internal training config:** `@dataclass(frozen=True)` for simple, or Pydantic if loaded from YAML/env where bad values are likely.
- **Row of results from a function:** `NamedTuple` (lightweight, unpackable) or a frozen dataclass.
- **JSON from an LLM or an API request:** **Pydantic**, because the data is untrusted.
- **Annotating dict-shaped data for a type checker** (e.g. a payload you pass to a library that wants a dict): `TypedDict`.
- **High-volume inner loops:** `@dataclass(slots=True)` or a NamedTuple; avoid validation cost per object. Often plain arrays are better than millions of objects.

**Why `tags: list = []` fails.** A mutable default would be a single list shared by every instance (the same trap as mutable default arguments). Dataclasses raise `ValueError` for list, dict and set defaults. Use:

```python
from dataclasses import dataclass, field

@dataclass
class Run:
    name: str
    tags: list[str] = field(default_factory=list)
```
