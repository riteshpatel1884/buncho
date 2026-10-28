```python
import math
from functools import reduce
from itertools import accumulate
from operator import mul


def fact_iter(n: int) -> int:
    if n < 0:
        raise ValueError("n must be >= 0")
    result = 1
    for k in range(2, n + 1):
        result *= k
    return result


def fact_rec(n: int) -> int:                  # clear, but depth n: fails near 1000
    if n < 0:
        raise ValueError("n must be >= 0")
    return 1 if n < 2 else n * fact_rec(n - 1)


def fact_reduce(n: int) -> int:
    return reduce(mul, range(2, n + 1), 1)


assert fact_iter(5) == fact_rec(5) == fact_reduce(5) == math.factorial(5) == 120
assert fact_iter(0) == 1


def factorials_between(lo: int, hi: int) -> dict[int, int]:
    # One pass: each factorial is the previous one times k.
    running = math.factorial(lo)
    out = {lo: running}
    for k in range(lo + 1, hi + 1):
        running *= k
        out[k] = running
    return out


assert factorials_between(3, 6) == {3: 6, 4: 24, 5: 120, 6: 720}
assert list(accumulate(range(1, 6), mul)) == [1, 2, 6, 24, 120]   # factorials of 1..5
```

**Large inputs**

- Python integers have arbitrary precision, so `math.factorial(1000)` is exact. It is just big and slower to produce.
- `fact_rec(5000)` raises `RecursionError`. Use the iterative version or `math.factorial`.
- `float` overflows around 170!. NumPy integers overflow silently at about 20! (int64).

**ML connection:** factorials appear in combinatorics and the Poisson and binomial distributions. For large values, work with **logarithms** instead of the number itself: `math.lgamma(n + 1)` is `log(n!)`, and `scipy.special.gammaln` does the same on arrays. This avoids overflow in the same way the log-sum-exp trick does for softmax.
