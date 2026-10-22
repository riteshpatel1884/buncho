```python
import numpy as np

def softmax(x, axis=-1, temperature=1.0):
    z = np.asarray(x, dtype=float) / temperature
    z = z - z.max(axis=axis, keepdims=True)      # shift so the max is 0
    e = np.exp(z)
    return e / e.sum(axis=axis, keepdims=True)

softmax(np.array([1000.0, 1001.0]))              # array([0.26894142, 0.73105858])
```

**Why the naive version fails.** `np.exp(1000)` overflows to `inf`, giving `inf / inf = nan`. Very negative inputs underflow to 0 (then `0/0`).

**Why the shift is valid.** `softmax(x) = softmax(x - c)` for any constant `c`, because `e^c` cancels in numerator and denominator. Choosing `c = max(x)` makes every exponent `<= 0`, so no overflow, and at least one term equals 1, so the denominator is never zero.

**Vectorisation details.** `keepdims=True` keeps shape `(batch, 1)` so broadcasting divides each row by its own sum. Without it you would get a shape error or, worse, a silently wrong `(batch, batch)` result.

**Temperature.** Divide logits by `T` first: `T < 1` sharpens the distribution (more greedy), `T > 1` flattens it (more random).

**Log-softmax.** Do **not** compute `np.log(softmax(x))`. Use the log-sum-exp trick:

```python
def log_softmax(x, axis=-1):
    z = x - x.max(axis=axis, keepdims=True)
    return z - np.log(np.exp(z).sum(axis=axis, keepdims=True))
```

This is what cross-entropy implementations (`F.cross_entropy`, `log_softmax` + NLL) do internally.
