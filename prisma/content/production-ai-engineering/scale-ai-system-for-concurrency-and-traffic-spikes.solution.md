**1. Find the bottleneck with load testing and metrics** (ramp traffic with realistic prompt/output lengths, watch each tier): API servers (CPU, connections, event loop), queue depth and wait time, GPU utilisation and **KV-cache usage**, vector DB/retrieval latency, provider **429s**, database connections, memory/OOM, timeouts and retries.

**Typical failure mechanisms**

- **Unbounded queues and retries:** latency climbs, clients time out and retry, multiplying load (**retry storm / metastable failure**).
- **GPU memory exhaustion:** too many concurrent sequences for the KV cache, so OOM or heavy preemption.
- **Blocking code** in async servers, thread-pool exhaustion, connection limits.
- **Provider rate limits** hit, cascading errors.
- **Cold starts:** autoscaling too slow because loading model weights takes minutes.

**2. Fixes**

1. **Protect the system (admission control):** concurrency limits and **bounded queues**, shed load early with 429/503 + `Retry-After`, priority classes (interactive over batch), per-tenant fair sharing. Reject fast instead of timing out slowly.
2. **Backpressure and timeouts everywhere**, with **retry budgets**, exponential backoff + jitter, and circuit breakers to stop retry storms.
3. **Scale the right thing:** horizontally scale stateless API tier; autoscale GPU replicas on **queue depth / KV utilisation / TTFT** (not CPU), with **warm pools** and predictive or scheduled scaling for known peaks; pre-load weights, use faster storage and image caching.
4. **Increase efficiency per GPU:** continuous batching, prefix caching, quantisation, right-sized `max_num_seqs` and context limits, chunked prefill, shorter outputs, speculative decoding.
5. **Reduce demand:** caching (semantic, prompt, retrieval), request coalescing/deduplication, smaller models for easy requests (routing), limiting max tokens.
6. **Absorb bursts asynchronously:** queue non-interactive work, batch APIs, return job ids for long tasks.
7. **Fallbacks and degradation:** switch to smaller model/provider, disable expensive features, serve cached/static responses when saturated.
8. **Multi-region and multi-provider capacity** for extra headroom.
9. **Stabilise peak-hour latency:** reserve capacity for interactive traffic, schedule batch jobs off-peak, isolate noisy tenants, track p99 not average.

**3. Validate:** load tests at 2 to 3x expected peak, spike tests, soak tests, chaos tests (kill replicas), and game days; define SLOs and autoscaling policies; monitor saturation signals and set alerts before limits.

**Principle:** under overload a healthy system degrades **predictably** (reject or slow some requests) instead of collapsing for everyone.
