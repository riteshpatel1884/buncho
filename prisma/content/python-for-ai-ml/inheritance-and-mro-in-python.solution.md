**Inheritance** lets a class reuse and extend another. Python supports **multiple inheritance**.

```python
class Base:
    def describe(self):
        return ["Base"]

class Logged(Base):
    def describe(self):
        return ["Logged"] + super().describe()

class Cached(Base):
    def describe(self):
        return ["Cached"] + super().describe()

class Service(Logged, Cached):        # diamond: both parents share Base
    def describe(self):
        return ["Service"] + super().describe()


print(Service().describe())
# ['Service', 'Logged', 'Cached', 'Base']
print([c.__name__ for c in Service.__mro__])
# ['Service', 'Logged', 'Cached', 'Base', 'object']
```

**MRO (method resolution order)** is the lookup order, computed with **C3 linearisation**. It keeps each class before its parents and respects the order you listed the bases in. `super()` does not mean "my parent". It means "the next class in the MRO", which is why `Logged` calls `Cached` here and `Base` runs only once.

**Diamond problem:** without a defined order, a shared ancestor could run twice or be ambiguous. C3 plus cooperative `super()` solves it. Every class in the chain must call `super()` for this to work.

**Where you see it in ML:** `class Net(nn.Module)` with `super().__init__()` as the first line, `torch.utils.data.Dataset` subclasses, and scikit-learn's `BaseEstimator` plus `TransformerMixin`.

**Use mixins sparingly, and prefer composition** (hold a tokenizer or a client as an attribute) when the relationship is "has a" rather than "is a". Deep hierarchies in research code are hard to read and hard to test.
