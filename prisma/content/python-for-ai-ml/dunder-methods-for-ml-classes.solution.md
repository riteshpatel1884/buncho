**Dunder methods** let your classes plug into Python syntax and built-ins. `len(x)` calls `x.__len__()`, `x[i]` calls `x.__getitem__(i)`, `x(...)` calls `x.__call__(...)`, `a + b` calls `a.__add__(b)`, `with x:` uses `__enter__/__exit__`, and `print(x)` uses `__repr__`/`__str__`.

**PyTorch Dataset**
- `__len__` lets the sampler know how many samples exist.
- `__getitem__(i)` returns sample `i`. `DataLoader` calls it with indices from a sampler (shuffling is just shuffling the indices), then collates results into batches.

```python
class PairDataset:
    def __init__(self, xs, ys): self.xs, self.ys = xs, ys
    def __len__(self): return len(self.xs)
    def __getitem__(self, i): return self.xs[i], self.ys[i]
```

**`nn.Module.__call__`.** `model(x)` runs registered forward pre-hooks and forward hooks (used by profilers, quantisation, feature extraction, and `torch.compile` integration) and then calls `forward`. Calling `model.forward(x)` directly **bypasses those hooks**. Always use `model(x)`.

**A Vector class** would reasonably define `__repr__`, `__eq__` (with `__hash__` if used in sets), `__add__`, `__mul__` (scalar), `__len__`, `__iter__` or `__getitem__`, and `__abs__` for the norm. Return `NotImplemented` for unsupported operand types instead of raising, so Python can try the reflected operation.

Do not overuse magic: implement only what makes the class feel natural, and keep `__repr__` useful for debugging.
