**Polymorphism:** one interface, many implementations. The caller does not care which concrete class it gets.

**Abstraction:** expose *what* an object does and hide *how*. In Python you express the contract with an **abstract base class (ABC)** or a **`Protocol`**.

```python
from abc import ABC, abstractmethod


class Embedder(ABC):
    @abstractmethod
    def embed(self, texts: list[str]) -> list[list[float]]:
        ...

    def embed_one(self, text: str) -> list[float]:       # shared behaviour
        return self.embed([text])[0]


class FakeEmbedder(Embedder):
    def embed(self, texts):
        return [[float(len(t)), 1.0] for t in texts]


class LowerEmbedder(Embedder):
    def embed(self, texts):
        return [[float(len(t.lower())), 2.0] for t in texts]


def index(documents: list[str], embedder: Embedder):
    return embedder.embed(documents)                      # works with any Embedder


assert index(["ab", "c"], FakeEmbedder()) == [[2.0, 1.0], [1.0, 1.0]]
assert index(["AB"], LowerEmbedder()) == [[2.0, 2.0]]

try:
    Embedder()                                            # cannot instantiate an abstract class
except TypeError as e:
    print(e)
```

**Duck typing:** Python does not require a shared base class. If an object has the methods the function calls, it works. `len()` works on anything with `__len__`. ABCs and `typing.Protocol` just make the contract explicit and checkable.

```python
from typing import Protocol

class SupportsEmbed(Protocol):
    def embed(self, texts: list[str]) -> list[list[float]]: ...
```

**Why it matters:** an LLM client wrapper that depends on an abstract `LLMClient` lets you swap providers, add a fake in tests, and avoid vendor lock-in. Keep the interface small and stable.
