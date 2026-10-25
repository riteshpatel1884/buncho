**Problem:** in a chain, availability is the **product** of the steps' availabilities (five steps at 99% each give about 95%), and one failure or bad output propagates downstream.

**Design for failure at each step**

1. **Classify the steps:** essential vs optional (enrichment, reranking, verification, personalisation). Optional steps can be **skipped** on failure (graceful degradation); essential ones need fallbacks.
2. **Per-step resilience:**
   - Timeouts, retries with backoff and jitter (idempotent steps only), circuit breakers.
   - **Fallback models/providers** per step with compatible prompts, tested regularly.
   - **Validation** of each output (schema, range, guardrails) before passing it on, with a repair/regenerate attempt; fail fast with clear error types.
3. **Orchestration pattern:** use a **durable workflow/state machine** (Temporal, Step Functions, LangGraph with checkpointing, queue-based workers) that persists state after each step, so a failure **resumes from the failed step** instead of restarting everything; dead-letter queues for poison messages.
4. **Compensation:** for steps with side effects, use the **saga pattern** (undo/compensate) and idempotency keys.
5. **Parallelise independent steps** and use **hedged/speculative calls** to reduce tail latency and the impact of one slow model.
6. **Partial results:** return what succeeded with a clear indication of what is missing; cached or default values for non-critical fields.
7. **Bulkheads and isolation:** separate pools/rate limits per model/provider so one failing dependency does not exhaust shared resources.
8. **Deadlines:** an overall time budget propagated through steps; skip optional steps when time is short.

```python
async def run_pipeline(req):
    state = await store.load(req.id) or {}
    for step in STEPS:
        if step.name in state: continue
        try:
            state[step.name] = await with_fallbacks(step, state, timeout=step.timeout)
        except StepFailed as e:
            if step.optional: state[step.name] = step.default; continue
            await store.save(req.id, state); raise                # resumable later
        await store.save(req.id, state)
    return state["final"]
```

**Observability:** trace each step with status, retries, fallback used, and error type; alerts on fallback rates and per-step failure rates; dashboards of end-to-end success vs per-step.

**Testing:** fault injection (make each model time out, return garbage or 429) in CI/staging, and verify degraded behaviour and recovery.

**Reduce chain length** where possible: fewer calls means fewer failure points, so merge steps or use a stronger single call if quality allows.
