```python
from functools import lru_cache
from itertools import islice


def fib_naive(n: int) -> int:                 # O(2^n): recomputes the same subproblems
    return n if n < 2 else fib_naive(n - 1) + fib_naive(n - 2)


@lru_cache(maxsize=None)
def fib_memo(n: int) -> int:                  # O(n) time, O(n) cache, recursion depth n
    return n if n < 2 else fib_memo(n - 1) + fib_memo(n - 2)


def fib_iter(n: int) -> int:                  # O(n) time, O(1) space
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a


def fib_gen():                                # infinite, lazy stream
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b


assert [fib_naive(i) for i in range(10)] == [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
assert fib_memo(50) == fib_iter(50) == 12586269025
assert list(islice(fib_gen(), 10)) == [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
assert fib_iter(1000) > 10**200              # Python ints never overflow
```

| Version | Time | Extra space | Use when |
|---|---|---|---|
| Naive recursion | O(2^n) | O(n) stack | Never in practice; shows the idea |
| `lru_cache` memoisation | O(n) | O(n) | Recursive formulation is clearer; repeated calls reuse the cache |
| Iterative | O(n) | O(1) | One value, simplest and fastest |
| Generator | O(1) per item | O(1) | You want the series as a stream (`islice`, `zip`, early stop) |

**Follow-ups:** very deep recursion hits `sys.getrecursionlimit()` (about 1000), so memoised `fib_memo(5000)` fails while the iterative version works. Fast doubling or matrix exponentiation computes the nth value in O(log n) big-integer operations. The same *cache repeated sub-results* idea is dynamic programming, and it is what you apply to caching embeddings or LLM responses.
