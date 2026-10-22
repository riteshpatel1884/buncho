- **Assignment** (`b = a`) copies nothing. It binds another name to the same object.
- **Shallow copy** (`copy.copy`, `list(a)`, `a[:]`, `dict.copy()`) creates a **new outer container** but its elements are the *same* objects.
- **Deep copy** (`copy.deepcopy`) recursively copies everything, using a memo dict to handle cycles.

Output:

```
[[1, 2, 99], [3, 4]]   # b: same object as a
[[1, 2, 99], [3, 4]]   # c: new outer list, but inner list is shared
[[1, 2], [3, 4]]       # d: fully independent
```

**Why it matters**
- Copying a config dict with `dict.copy()` and then editing a nested value changes the original config. Use `deepcopy`.
- `df.copy()` is deep for the data buffers, but Python objects stored inside object-dtype cells are not deep-copied.
- `copy.deepcopy(model)` is a common way to snapshot a PyTorch model (for EMA or best-checkpoint), but it can be slow and memory-hungry. Often `{k: v.clone() for k, v in model.state_dict().items()}` is cheaper.
- Immutable objects (ints, strings, tuples of immutables) do not need copying.
- Deep copy can break objects holding resources (open files, locks, DB connections).
