**Classify failures**

| Type | Examples | Response |
|---|---|---|
| **Transient infrastructure** | Timeouts, 429/5xx, network | Retry with exponential backoff + jitter, circuit breaker |
| **Tool errors** | Bad args, not found, permission denied | Return a **clear error to the model** so it can correct; do not blindly retry |
| **Model errors** | Malformed call, wrong tool, hallucinated params | Validate against schema, re-prompt with the error, switch model |
| **Logic errors** | Wrong plan, wrong result accepted | Verification step, reflection, replanning |
| **Stuck behaviour** | Loops, no progress | Step/budget limits, loop detection, escalate |
| **External state** | Half-completed side effects | Idempotency, compensation (undo), checkpoints |

**Techniques**

1. **Structured errors:** `{"error": "invalid_date", "message": "date must be YYYY-MM-DD", "hint": "..."}` so the agent can self-correct.
2. **Retries with limits** only for idempotent or transient cases; cap attempts.
3. **Idempotency keys** for writes so retried calls do not duplicate actions.
4. **Checkpointing:** persist state after each step so the run can resume rather than restart.
5. **Compensating actions (saga pattern)** for multi-step side effects: if step 3 fails, undo steps 1 and 2.
6. **Fallbacks:** alternate tool, cheaper approach, partial result with explanation.
7. **Verification:** check outputs (tests, schema, sanity checks) before continuing.
8. **Escalation:** after N failures, stop and hand off to a human with the full trace.
9. **Observability:** trace every step with inputs, outputs, errors.

```python
def call_tool(name, args):
    try:
        validate(name, args)
        return with_retries(lambda: tools[name](**args), retry_on=(Timeout, RateLimit), attempts=3)
    except ToolError as e:
        return {"error": e.code, "message": str(e), "hint": e.hint}     # model can adjust
```

Test failure handling with fault injection (kill an API mid-run, return garbage) as part of the eval suite.
