| | Ordered | Mutable | Duplicates | Lookup `x in` | Append | Index |
|---|---|---|---|---|---|---|
| `list` | yes | yes | yes | O(n) | O(1) amortised | O(1) |
| `tuple` | yes | no | yes | O(n) | n/a | O(1) |
| `set` | no (arbitrary) | yes | no | O(1) average | O(1) average | n/a |
| `dict` | insertion order (3.7+) | yes | unique keys | O(1) average | O(1) average | by key |

**Choosing**
- `list`: ordered, growable sequence (batches, token ids).
- `tuple`: fixed records, hashable keys (`(user_id, item_id)`), safe to share.
- `set`: membership tests, de-duplication, set algebra (`a & b`, `a - b`).
- `dict`: key-to-value maps, counting (`collections.Counter`), grouping (`defaultdict(list)`), caches.
- Also know `deque` (O(1) pops at both ends), `heapq` (top-k in O(n log k)) and `bisect` (binary search on sorted lists).

**The slow filter:** `banned_ids` is probably a **list**, so each `in` scans up to n items: O(n·m) overall. Convert once: `banned = set(banned_ids)`, which makes each check O(1) on average.

```python
banned = set(banned_ids)
clean = [i for i in ids if i not in banned]
```

**Requirement for keys and set members:** they must be hashable (immutable, with consistent `__hash__` and `__eq__`). Lists, dicts and sets are not; tuples of hashables are.
