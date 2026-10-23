```python
from collections import Counter

def find_duplicates(items):
    seen, dups = set(), set()
    for x in items:
        if x in seen:
            dups.add(x)
        else:
            seen.add(x)
    return list(dups)

def find_duplicates_counter(items):
    return [x for x, n in Counter(items).items() if n > 1]

nums = [1, 2, 3, 2, 4, 1, 5, 1]
print(find_duplicates(nums))          # [1, 2] (order not guaranteed)
print(find_duplicates_counter(nums))  # [1, 2] (first-seen order)
print(len(nums) != len(set(nums)))    # True: quick "has duplicates?" check
```

**Complexity:** O(n) time and O(n) extra space, because set lookups are O(1) on average. The naive `items.count(x)` inside a loop is O(n^2).

**Notes**

- Elements must be **hashable**. For lists of lists, convert to tuples first.
- Use `Counter` when you also need the counts.
- With pandas: `df["col"][df["col"].duplicated()].unique()` or `df[df.duplicated(keep=False)]` to see all copies.
