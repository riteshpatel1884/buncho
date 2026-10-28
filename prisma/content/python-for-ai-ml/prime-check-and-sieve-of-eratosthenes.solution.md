```python
import math

import numpy as np


def is_prime(n: int) -> bool:
    if n < 2:
        return False
    if n % 2 == 0:
        return n == 2
    for d in range(3, math.isqrt(n) + 1, 2):      # only odd divisors up to sqrt(n)
        if n % d == 0:
            return False
    return True


def sieve(n: int) -> list[int]:
    if n < 2:
        return []
    flags = bytearray([1]) * (n + 1)
    flags[0:2] = b"\x00\x00"
    for i in range(2, math.isqrt(n) + 1):
        if flags[i]:
            flags[i * i::i] = bytearray(len(range(i * i, n + 1, i)))   # cross out multiples
    return [i for i, f in enumerate(flags) if f]


def sieve_np(n: int) -> np.ndarray:
    flags = np.ones(n + 1, dtype=bool)
    flags[:2] = False
    for i in range(2, math.isqrt(n) + 1):
        if flags[i]:
            flags[i * i::i] = False
    return np.flatnonzero(flags)


assert [x for x in range(30) if is_prime(x)] == [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
assert sieve(30) == [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
assert sieve_np(100).tolist() == sieve(100)
assert len(sieve(10_000)) == 1229
```

**Why `sqrt(n)`:** if `n = a * b` with `a <= b`, then `a <= sqrt(n)`. So one divisor must be at most the square root.

**Complexity**

- `is_prime`: O(sqrt(n)) per number. Fine for one value, slow for 64-bit numbers (use Miller-Rabin).
- Sieve of Eratosthenes: O(n log log n) time, O(n) memory, much better than calling `is_prime` for each number.
- The NumPy version moves the inner loop into C, the same vectorisation idea you use in ML code.
