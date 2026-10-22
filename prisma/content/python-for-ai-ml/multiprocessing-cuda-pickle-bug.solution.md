**Error 1: pickling.** `Pool.map` sends the function and arguments to workers via **pickle**. Lambdas and nested or local functions cannot be pickled by reference. Use a **module-level function** (or `functools.partial` of one).

**Error 2: CUDA with fork.** On Linux, `fork` (the default start method through Python 3.13) copies the parent, including an already-initialised CUDA context, into children. CUDA does not support that, so initialising CUDA in a forked child raises this error. Related problems: forking after threads have started can deadlock, and each worker holding its own copy of a large model wastes GPU memory.

**Correct designs**
1. **Use the `spawn` start method and build the model inside each worker**, only when you truly need several GPU processes:

```python
import multiprocessing as mp, torch

_model = None

def init_worker():
    global _model
    _model = Net().cuda().eval()               # created in the child, after spawn

def predict(batch):
    with torch.inference_mode():
        return _model(batch.cuda()).cpu()

if __name__ == "__main__":                     # required with spawn
    ctx = mp.get_context("spawn")
    with ctx.Pool(2, initializer=init_worker) as pool:
        results = pool.map(predict, batches)
```

2. **Usually better: one process owns the GPU** and CPU work is parallelised separately. Use `DataLoader(num_workers=N)` for preprocessing (CPU workers) and run the model in the main process with large batches. GPUs are already parallel; several processes sharing one GPU mostly add overhead.

3. For serving, use a framework designed for it (separate worker processes each loading the model once, or a dedicated inference server).

**Also remember:** the `if __name__ == "__main__":` guard is mandatory with spawn, arguments and return values must be picklable (and large tensors are copied, so prefer shared memory or file paths), and never touch CUDA before forking.
