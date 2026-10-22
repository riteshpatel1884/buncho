```python
from itertools import islice

def batched(iterable, n):
    if n < 1:
        raise ValueError("n must be at least 1")
    it = iter(iterable)               # works for lists AND one-shot generators
    while batch := list(islice(it, n)):
        yield batch

for batch in batched(read_texts(), 100):
    vectors = client.embed(batch)
```

**Why it works.** `islice(it, n)` consumes up to `n` items from the *same* iterator each time. When the iterator is exhausted it returns an empty list, which is falsy, so the loop ends. The last batch may be shorter. Memory use is O(n).

**Python 3.12+** ships `itertools.batched(iterable, n)`, which yields **tuples**. Use it when available (and `strict=True`, new in 3.13, if you require full batches).

**Production notes**
- Batch by **token count or bytes** too, not only item count, since API limits are often on tokens.
- Keep an index with each batch so failed batches can be retried and results re-ordered.
- Combine with concurrency (asyncio + semaphore) and retries.
