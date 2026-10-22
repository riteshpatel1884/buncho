**Reference counting.** Every object tracks how many references point to it. When the count hits zero it is freed immediately. `del x` only removes the *name*; the object lives on while anything else references it (a list, a closure, a traceback, a cache, a notebook's `_` or `Out[]` history).

**Cyclic GC.** Reference cycles (`a.other = b; b.other = a`) never reach zero, so a generational garbage collector periodically finds unreachable cycles. `gc.collect()` forces a run.

**Why memory stays high after `del`**
1. Something still references it (most common).
2. Freed memory is often kept by the allocator (pymalloc arenas, glibc malloc) for reuse instead of being returned to the OS, so RSS may not fall. Fragmentation makes this worse.
3. GPU: PyTorch's caching allocator holds freed blocks. `torch.cuda.empty_cache()` releases unused cached blocks, but memory held by live tensors stays.

**Finding leaks**
- Look for things that grow: global lists/dicts used as caches without limits, `lru_cache(maxsize=None)`, appended tensors that keep their autograd graph, per-request objects stored in module state, registered hooks and callbacks.
- Tools: `tracemalloc` (snapshot diffs), `objgraph`, `memray`, `psutil` for RSS over time, `torch.cuda.memory_summary()`.
- Mitigations: bounded caches, `weakref`, processing in chunks, and recycling worker processes (`max_requests` in Gunicorn) as a safety net.
