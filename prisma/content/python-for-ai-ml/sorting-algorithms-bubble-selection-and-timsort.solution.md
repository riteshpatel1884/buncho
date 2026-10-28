```python
import heapq
import random


def bubble_sort(a: list) -> list:
    a = list(a)                                  # do not mutate the input
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:                          # already sorted: stop early
            break
    return a


def selection_sort(a: list) -> list:
    a = list(a)
    for i in range(len(a) - 1):
        m = min(range(i, len(a)), key=a.__getitem__)   # index of the smallest remaining item
        a[i], a[m] = a[m], a[i]
    return a


data = [random.randint(-50, 50) for _ in range(200)]
assert bubble_sort(data) == selection_sort(data) == sorted(data)
assert bubble_sort([]) == [] and bubble_sort([1]) == [1]

pairs = [("b", 1), ("a", 1), ("c", 0)]
assert sorted(pairs, key=lambda p: p[1]) == [("c", 0), ("b", 1), ("a", 1)]   # stable: b stays before a

assert heapq.nlargest(3, [5, 1, 9, 7, 3]) == [9, 7, 5]
```

| Algorithm | Best | Average / worst | Extra space | Stable |
|---|---|---|---|---|
| Bubble sort | O(n) with early exit | O(n^2) | O(1) | Yes |
| Selection sort | O(n^2) | O(n^2) | O(1) | No (in the swap version) |
| `sorted` / `list.sort` (Timsort) | O(n) on nearly sorted input | O(n log n) | O(n) | **Yes** |

**In real code, use `sorted()` or `list.sort()`.** Timsort is a hybrid of merge sort and insertion sort that exploits runs of already-ordered data. It accepts `key=` and `reverse=`, and it is stable, so you can sort by several keys in passes.

**Related tools**

- `np.sort` and `np.argsort` for arrays, with `argsort` giving the ranking order.
- `heapq.nlargest(k, ...)` or `np.argpartition` for the **top-k** without sorting everything (O(n log k) or O(n)).
- Hand-written O(n^2) sorts are fine for tiny inputs and interview questions, and wrong for datasets.
