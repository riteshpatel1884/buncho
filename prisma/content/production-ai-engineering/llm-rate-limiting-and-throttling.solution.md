**Part 1: limiting your own API (protecting capacity and cost)**

- **Dimensions:** requests/minute **and tokens/minute** (cost scales with tokens), concurrency, per user, API key, tenant and plan; also daily/monthly budgets.
- **Algorithms:** token bucket or sliding-window counters (fixed windows allow bursts at boundaries); concurrency limits via semaphores; distributed state in Redis with atomic scripts.
- **Estimate tokens up front** (input + `max_tokens`), reserve them, then **reconcile with actual usage** afterwards.
- **Response:** HTTP **429** with `Retry-After` and rate-limit headers; **priority queues** (paid or interactive over batch); load shedding under overload.

**Part 2: provider limits (RPM/TPM) at peak**

1. **Know your quotas** per model and region; request increases early; separate keys/projects per workload.
2. **Client-side throttling:** a shared limiter in front of the provider (gateway) so all services together stay below limits, rather than letting each hit 429s.
3. **Retry correctly:** on 429/5xx, **exponential backoff with jitter**, honour `Retry-After`; cap total retries and deadline; only retry idempotent calls.
4. **Queue and smooth:** put non-urgent work (batch enrichment, evals) on a queue processed at a controlled rate, or use **batch APIs** (lower cost, separate limits).
5. **Reduce token use:** shorter prompts, caching (prefix, semantic), trimming context, smaller output limits, cheaper models for easy tasks.
6. **Spread load:** multiple deployments/regions/accounts, and **fallback models/providers** when saturated.
7. **Autoscale self-hosted capacity** where applicable; reserved/provisioned throughput for critical workloads.
8. **Backpressure to users:** friendly "busy" messages, queue position, graceful degradation.

```python
async def call_llm(req):
    await limiter.acquire(tokens=estimate(req))            # shared TPM/RPM limiter
    for attempt in range(5):
        try:
            return await provider.complete(req)
        except RateLimitError as e:
            await asyncio.sleep(e.retry_after or min(30, 2**attempt) * random.uniform(0.5, 1.5))
    raise Overloaded()                                      # triggers fallback/queue
```

**Monitor:** 429 rate, queue wait, limiter rejections, spend per tenant, headroom against provider quotas.
