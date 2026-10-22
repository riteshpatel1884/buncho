```python
import json

def load_examples(path):
    with open(path) as f:
        for line in f:
            yield json.loads(line)

examples = load_examples("train.jsonl")
print("examples:", len(examples))

for epoch in range(3):
    total = 0
    for ex in examples:
        total += train_step(ex)
    print(epoch, total)
```

The program crashes on `len`, and after that is removed, epoch 0 trains but epochs 1 and 2 print `0`. Explain both symptoms and fix them without loading the whole file in memory.
