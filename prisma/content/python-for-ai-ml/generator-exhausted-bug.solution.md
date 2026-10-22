**Symptoms**
1. `len(examples)` raises `TypeError: object of type 'generator' has no len()`. Generators are lazy and have no known length.
2. A generator is a one-shot iterator. After epoch 0 consumes it, it is **exhausted**; later `for` loops get zero items without any error, so the loss total is 0 and training silently does nothing.

**Fix 1: create a fresh generator every epoch**

```python
for epoch in range(3):
    total = 0
    for ex in load_examples("train.jsonl"):       # new generator, file reopened
        total += train_step(ex)
```

**Fix 2: make it a re-iterable object** (cleaner API)

```python
class JsonlDataset:
    def __init__(self, path): self.path = path
    def __iter__(self):                           # new generator for each loop
        with open(self.path) as f:
            for line in f:
                yield json.loads(line)

examples = JsonlDataset("train.jsonl")            # loop over it as many times as you like
```

If you need a length, count once (`sum(1 for _ in examples)`) or store it in metadata. If the data fits in memory, `list(...)` is simplest.

**Guard rails:** assert that an epoch processed at least one example (`assert n_seen > 0`), because exhausted iterators fail silently.
