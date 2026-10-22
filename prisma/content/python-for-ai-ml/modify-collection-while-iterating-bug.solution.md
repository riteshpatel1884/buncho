**First snippet:** prints `['', 'a', 'b']`. The list iterator advances by position. Removing item 0 shifts the others left, and then the iterator moves to index 1, **skipping** the element that slid into index 0. So one empty string survives.

**Second snippet:** raises `RuntimeError: dictionary changed size during iteration`. Dicts detect size changes while iterating and refuse to continue.

**Correct versions**

```python
# Build a new collection (best)
docs = [d for d in docs if d]
cfg  = {k: v for k, v in cfg.items() if v is not None}

# In-place on the same list object, if others hold a reference to it
docs[:] = [d for d in docs if d]

# Iterate over a snapshot when you must delete from the original
for k in list(cfg):
    if cfg[k] is None:
        del cfg[k]
```

**Rules of thumb**
- Never add or remove items from a collection you are iterating over. Build a new one or iterate over a copy.
- `list.remove(x)` is also O(n) and removes only the first match, so repeated removal is both subtle and slow.
- Changing the *values* of existing dict keys while iterating is allowed; changing the set of keys is not.
