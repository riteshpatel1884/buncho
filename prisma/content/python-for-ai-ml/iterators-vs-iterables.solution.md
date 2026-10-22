- An **iterable** has `__iter__()` that returns an iterator (lists, dicts, strings, files, DataFrames).
- An **iterator** has `__next__()` (returns the next item or raises `StopIteration`) and `__iter__()` that returns itself. It is **single-use**.

`for x in obj:` is roughly:

```python
it = iter(obj)            # obj.__iter__()
while True:
    try:
        x = next(it)      # it.__next__()
    except StopIteration:
        break
    ...
```

A list is a re-iterable because each `iter(lst)` returns a *fresh* iterator. A generator or file handle is its own iterator, so it is exhausted after one pass.

```python
class Batches:
    """Re-iterable: every loop starts from the beginning."""
    def __init__(self, data, size):
        self.data, self.size = data, size
    def __iter__(self):                     # returns a new generator each time
        for i in range(0, len(self.data), self.size):
            yield self.data[i:i + self.size]

b = Batches(list(range(10)), 4)
list(b), list(b)          # both full: works for multiple epochs
```

**PyTorch link**
- **Map-style** `Dataset`: implements `__getitem__` and `__len__`; supports random access and shuffling by index.
- **Iterable-style** `IterableDataset`: implements `__iter__`; used for streams or huge files. With multiple workers you must shard inside `__iter__` (using `get_worker_info()`) or every worker returns the same data, producing duplicates.
- Keep training data as a re-iterable object, not a bare generator, so epoch 2 is not empty.
