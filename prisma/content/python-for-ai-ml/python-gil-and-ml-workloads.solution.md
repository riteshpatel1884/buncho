**What it is.** The GIL is a mutex in CPython that lets only one thread execute Python bytecode at a time. It exists because CPython manages memory with reference counting, which is not thread-safe. One global lock keeps refcounts consistent and makes C extensions simpler to write.

**Effect on workloads**
- **CPU-bound pure-Python code** (a Python-loop tokenizer, custom feature functions): threads do not run in parallel. More threads can even be *slower* because of lock contention.
- **I/O-bound code** (API calls, DB reads, downloads): the GIL is released while waiting, so threads or asyncio give real speedups.
- **NumPy, PyTorch, TensorFlow, Rust-backed tokenizers**: heavy operations run in native code and release the GIL, so threads can overlap on those calls. The Python glue between them is still serialised.

**Work-arounds**
1. `multiprocessing` or `ProcessPoolExecutor`: separate interpreters with separate GILs. Cost: pickling data between processes and higher memory use. `DataLoader(num_workers=n)` works this way.
2. Push the hot loop into native code: vectorise with NumPy, or use Numba, Cython or Rust.
3. Use asyncio or threads for network-bound work such as batched LLM calls.
4. Scale out with Ray or Dask when one machine is not enough.
5. Free-threaded (no-GIL) builds, PEP 703, are experimental from Python 3.13 and library support is still maturing.

**Interview tip:** the GIL does not make your code thread-safe. `counter += 1` across threads is still a race condition; the GIL only protects interpreter internals.
