```python
docs = ["", "", "a", "b"]
for d in docs:
    if not d:
        docs.remove(d)
print(docs)             # expected ['a', 'b']

cfg = {"lr": 1e-3, "wd": None, "seed": None}
for k in cfg:
    if cfg[k] is None:
        del cfg[k]
```

Explain what each snippet does and write correct versions.
