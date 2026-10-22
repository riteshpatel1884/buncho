| | Threading | Multiprocessing | asyncio |
|---|---|---|---|
| Model | OS threads, one GIL | Separate processes | One thread, cooperative tasks |
| Parallel CPU work | No (pure Python) | Yes | No |
| Best for | Blocking I/O, simple code | CPU-bound Python | Very many concurrent I/O waits |
| Overhead | Low | High (memory, pickling) | Lowest per task |
| Pitfall | Races, GIL contention | Serialisation cost, spawn time | One blocking call stalls everything |

**Job 1 (embedding API): asyncio**, with a semaphore to cap concurrency and respect rate limits. Threads also work if the client library is synchronous. Batch inputs per request too.

**Job 2 (50 GB pure-Python cleaning): multiprocessing.** It is CPU-bound, so you need separate interpreters. Shard the files, give each worker a shard, and write per-shard output instead of sending big objects back. Use a streaming reader inside each worker. Better still, replace Python loops with a vectorised or Rust-based tool where possible.

**Job 3 (GPU + CPU overlap): worker processes plus prefetching**, which is what `DataLoader(num_workers>0, prefetch_factor, pin_memory=True)` provides. The GPU kernels themselves are async relative to Python, so the main process only needs to enqueue work.

**Rule of thumb:** waiting on a network = asyncio/threads; burning CPU in Python = processes; burning CPU in native code = threads often suffice.
