```python
def dedupe(items):
    return list(dict.fromkeys(items))

print(dedupe([3, 1, 3, 2, 1, 4]))   # [3, 1, 2, 4]
```

**Why `dict.fromkeys` works:** dict keys are unique and, since Python 3.7, dicts keep insertion order. Building a dict from the items keeps only the first occurrence of each, in order. Complexity O(n).

**Why not `list(set(x))`:** sets are unordered, so the order is lost (and can change between runs for strings).

**Explicit version (also works for unhashable items with a key function)**

```python
def dedupe_by(items, key=lambda x: x):
    seen = set()
    out = []
    for x in items:
        k = key(x)
        if k not in seen:
            seen.add(k)
            out.append(x)
    return out

dedupe_by([[1, 2], [1, 2], [3]], key=tuple)           # [[1, 2], [3]]
dedupe_by(["Apple", "apple", "Pear"], key=str.lower)  # ['Apple', 'Pear']
```

**pandas:** `df.drop_duplicates(subset=["id"], keep="first")` does the same for rows.

**Gotcha:** items must be hashable; the `key` function is the escape hatch.
