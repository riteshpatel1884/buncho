**Why queue:** GPU capacity is finite and requests are expensive and variable. Without control, load spikes inflate TTFT for everyone (queueing delay explodes as utilisation approaches 100%), or cause OOM and crashes.

**Architecture**

```text
client -> gateway (auth, rate limit, quota) -> admission control -> priority queues -> scheduler (per replica / global) -> model server
                                                    │ 429/503 + Retry-After when full
```

**Components**

1. **Admission control:** bound queue length and estimated wait; reject early (429/503, `Retry-After`) when SLO cannot be met; estimate request cost (input tokens + max_tokens) and enforce per-request caps.
2. **Priority classes:** e.g. P0 interactive/paying, P1 standard, P2 batch/background. Separate queues per class (or per tenant).
3. **Scheduling policies:**
   - **Strict priority** (risk of starvation), **weighted fair queuing / deficit round robin** by tenant, **aging** to lift old low-priority work.
   - **Shortest-job-first / shortest-remaining-time** using predicted output length (reduces mean latency; needs prediction and anti-starvation).
   - **Deadline/SLO-aware (EDF)** for requests with latencies.
   - Token-budget scheduling per step (vLLM `max_num_batched_tokens`), chunked prefill to keep decodes flowing.
4. **Preemption:** under memory pressure evict low-priority sequences (swap KV to CPU or recompute) so high priority proceeds; vLLM supports priority scheduling and preemption.
5. **Fairness and quotas:** per-tenant rate limits (tokens per minute), concurrency caps, burst credits, noisy-neighbour isolation.
6. **Backpressure and degradation:** shed low priority first, route to smaller model, shorten max_tokens, serve cached answers.
7. **Async/batch lane:** long jobs through durable queues (SQS, Kafka, Celery, Temporal) with callbacks/polling, run on spare capacity (batch APIs priced at about 50% discount).

```python
import heapq, itertools
q, tie = [], itertools.count()
def submit(req, prio): heapq.heappush(q, (prio, req.arrival, next(tie), req))   # lower prio value = more urgent
def next_request(): return heapq.heappop(q)[-1] if q else None
```

**Metrics:** queue wait by class, rejection rate, SLO attainment (TTFT p95), starvation (max wait), preemption count, utilisation, goodput.
