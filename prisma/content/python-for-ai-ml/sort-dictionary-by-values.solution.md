```python
from operator import itemgetter
import heapq

scores = {"asha": 82, "ben": 95, "chen": 82, "dia": 70}

ranked = dict(sorted(scores.items(), key=lambda kv: kv[1], reverse=True))
# {'ben': 95, 'asha': 82, 'chen': 82, 'dia': 70}

ranked2 = dict(sorted(scores.items(), key=itemgetter(1), reverse=True))   # same, slightly faster

top3 = heapq.nlargest(3, scores.items(), key=itemgetter(1))               # O(n log k)

# ties: sort by score desc, then name asc
tie_safe = sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))
```

**How it works**

- `dict.items()` gives `(key, value)` pairs; `sorted` returns a **list** of pairs.
- `key=lambda kv: kv[1]` tells `sorted` to compare the values.
- Since Python 3.7 dicts preserve insertion order, so `dict(sorted_pairs)` keeps the sorted order.

**Complexity:** `sorted` is O(n log n); `heapq.nlargest` is better when you need only the top few. `sorted` is stable, so equal scores keep their original order.

**Use cases:** ranking words by frequency, models by validation score, retrieved documents by similarity.
