A **generator** is a function containing `yield`. Calling it returns an iterator that produces values **lazily**, one at a time, pausing and resuming its local state between values.

```python
import json

def read_jsonl(path):
    with open(path) as f:
        for line in f:              # file objects are lazy too
            yield json.loads(line)

squares_list = [i * i for i in range(10_000_000)]   # about 80 MB of pointers plus int objects
squares_gen  = (i * i for i in range(10_000_000))   # a few hundred bytes
```

**Why it matters for ML**
- Memory stays roughly constant: a 50 GB JSONL file can be consumed record by record or in batches.
- You can start training before preprocessing finishes (pipelines compose: read, clean, tokenise, batch).
- Infinite or streaming sources are possible (`itertools.count`, a Kafka consumer).

**Limitations**
- **One pass only.** A generator is exhausted after one loop, so a second epoch silently yields nothing. Wrap creation in a function or class and create a fresh generator per epoch.
- No `len()`, no indexing, no random access, so shuffling needs a buffer (shuffle-buffer approach) or pre-shuffled shards.
- Harder to debug, and exceptions surface at consumption time, not creation time.

**Handy tools:** `itertools.islice` (take N), `itertools.chain`, `yield from`, and generator expressions.
