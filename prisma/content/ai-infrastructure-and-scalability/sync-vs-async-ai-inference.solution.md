| | **Synchronous (online/real-time)** | **Asynchronous (queue-based)** | **Batch (offline)** |
|---|---|---|---|
| Pattern | Client sends request and **waits** on the open connection for the response (often **streamed**) | Client submits a job, gets a **job id** immediately; result via polling, webhook, WebSocket or message queue | Large datasets processed on a schedule or bulk job |
| Latency target | Milliseconds to a few seconds (TTFT/interactive) | Seconds to minutes (or longer) | Hours |
| Examples | Chatbots, autocomplete, voice agents, search | Document processing, video/image generation, long agent runs, report generation | Embedding a corpus, nightly classification, evals, dataset labelling |
| Throughput efficiency | Lower (must keep headroom, small batches) | Higher (queue smooths load, larger batches) | Highest (fully packed GPUs, spot instances) |
| Failure handling | Client retries; timeouts (gateway 30 to 60 s limits) | Durable queue, automatic retries, dead-letter queue, idempotency keys | Checkpoint and resume |
| Cost | Highest per token (reserved capacity) | Lower | Lowest (batch APIs about 50% off) |
| Complexity | Simple API | Needs queue, worker, status store, notifications | Pipeline orchestration |

**Choose**

- **Synchronous** when a human or downstream step blocks on the answer and response time is under a few seconds. Use streaming to reduce perceived latency and WebSocket/SSE for long generations.
- **Asynchronous** when processing exceeds HTTP timeouts, load is bursty, results aren't needed instantly, or you want to decouple producers from GPU capacity.
- **Batch** for non-urgent bulk workloads; use provider batch APIs or offline vLLM/Ray Data to maximise utilisation.

**Async design checklist**

```text
POST /jobs -> 202 {job_id}            # enqueue (SQS/Kafka/Redis/Celery/Temporal)
worker pulls job -> runs inference -> stores result, updates status
GET /jobs/{id} -> {status, result}    # or webhook / push notification
```

Idempotency keys, retries with backoff, visibility timeouts, priority queues, progress updates, result TTL, authentication on callbacks, and dead-letter handling. Hybrid is common: sync fast path with automatic fallback to async for large inputs (HTTP 202).
