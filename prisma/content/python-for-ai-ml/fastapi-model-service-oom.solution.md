**Diagnosis from the evidence**
1. **Model memory is multiplied by workers.** Each of 8 Gunicorn workers loads its own 1.9 GB model (about 15 GB total before any request) because the model is created inside the app module after fork, without shared memory. With a 16 GB limit, there is almost no headroom, and request buffers push it over.
2. **Unbounded growth from the new cache.** `RESULT_CACHE` is a plain dict per worker with no size limit or TTL, keyed by full input text. Memory (RSS) per worker climbs steadily with traffic and is never freed, which matches the sawtooth ending in OOMKilled.
3. **Large request handling:** inputs up to several MB are tokenised in full, and `torch.no_grad` is missing in one endpoint so autograd tensors are retained until garbage collection; long inputs create big temporary tensors. These create spikes rather than steady growth.
4. **Latency symptom:** the endpoint is `async def` but calls the model synchronously, blocking the event loop (a single worker handles one inference at a time), and swapping or GC pauses near the memory limit amplify tail latency.

**Short-term mitigation (hours)**
- Reduce workers to 3-4 so memory fits with headroom; set Gunicorn `max_requests` (+ jitter) to recycle workers; set sensible request size limits and truncation.
- Bound the cache with `cachetools.TTLCache(maxsize=...)` or disable it until fixed; add memory requests/limits that match reality and alerts at 80% usage.

**Root-cause fix (days)**
- Load the model **once** per worker in a startup/lifespan hook, with `eval()` and `inference_mode()` for all paths; share weights between workers by loading before fork with `--preload` (copy-on-write helps for read-only memory-mapped weights, but Python refcounts can still cause copying, so measure). Better: memory-map weights (`safetensors`) or use a smaller/quantised model (int8 halves or quarters the footprint).
- Make inference non-blocking: use `def` endpoints (run in a threadpool) or `run_in_executor`; batch requests with a small queue (dynamic micro-batching) to raise GPU/CPU utilisation.
- Replace the in-process cache with Redis (shared, with TTL and eviction policy) keyed by hash of normalised text.

**Long-term design**
- Separate the **model server** (one process per GPU/CPU pool owning the weights; Triton, TorchServe, vLLM or a dedicated inference service) from the thin API layer, scale each independently with autoscaling on queue depth and latency.
- Load-test before release (Locust/k6) at expected and peak traffic, and track RSS per worker, p95/p99 latency, queue depth and OOM events. Add a canary stage.

**How to confirm.** Reproduce locally with the same worker count; use `tracemalloc`/`memray` snapshot diffs on a worker under load; compare RSS after warm-up vs after an hour; verify the fix by a soak test with flat memory.
