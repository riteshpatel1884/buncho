An embedding API accepts at most 100 texts per request. You have a generator yielding millions of texts.

Write `batched(iterable, n)` that yields lists of at most `n` items without loading everything into memory. Then say how Python 3.12 changes this.
