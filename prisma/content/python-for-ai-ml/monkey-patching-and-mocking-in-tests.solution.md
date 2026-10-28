**Monkey patching** means changing a class, module or function **at runtime** by reassigning its attributes. It works because everything in Python is an object looked up by name.

```python
import math

def fake_sqrt(x):
    return -1

original = math.sqrt
math.sqrt = fake_sqrt          # every caller now gets the patched version
assert math.sqrt(9) == -1
math.sqrt = original           # always restore it
```

**Acceptable use: tests.** Replace slow, costly or non-deterministic dependencies with fakes. `unittest.mock.patch` restores the original for you.

```python
from unittest.mock import patch


def call_llm(prompt: str) -> str:          # real implementation calls an API
    raise RuntimeError("network not available in tests")


def summarise(text: str) -> str:
    return call_llm(f"Summarise: {text}").strip().upper()


def test_summarise():
    with patch(f"{__name__}.call_llm", return_value=" ok ") as fake:
        assert summarise("long text") == "OK"
        fake.assert_called_once()


test_summarise()
```

**Patch where the name is looked up**, not where it is defined. If `app.py` does `from client import call_llm`, patch `app.call_llm`.

**Risks in production code**

- It is **global and invisible**: other code and other threads see the change, and a reader cannot tell from the call site.
- It breaks silently when the library upgrades and the patched internals change.
- Order-dependent behaviour makes bugs hard to reproduce.

**Better alternatives:** dependency injection (pass the client in), subclassing, wrappers or decorators, and the library's own extension hooks. Some libraries, notably async and compatibility layers, patch the standard library by design. Treat that as a deliberate exception.
