**Principle:** budgets must be enforced **by the harness in code**, not by asking the model to be frugal.

**What to cap**

| Dimension | Example limit |
|---|---|
| Steps / LLM calls | Max 25 per task |
| Tokens (input + output) | 300k per task |
| Cost (USD) | $1.00 per task, $20 per user per day |
| Wall-clock time | 5 minutes |
| Tool calls by type | Max 5 web searches, 3 code runs |
| Concurrency and rate | Per user and per tenant |

**Implementation**

```python
class Budget:
    def __init__(self, max_usd=1.0, max_steps=25, max_seconds=300):
        self.spent, self.steps, self.t0 = 0.0, 0, time.time()
        self.max_usd, self.max_steps, self.max_seconds = max_usd, max_steps, max_seconds
    def charge(self, usage):
        self.spent += usage.input_tokens * PRICE_IN + usage.output_tokens * PRICE_OUT
        self.steps += 1
    def exhausted(self):
        return (self.spent >= self.max_usd or self.steps >= self.max_steps
                or time.time() - self.t0 >= self.max_seconds)

while not done:
    if budget.exhausted():
        return wrap_up(state, reason="budget")      # final cheap call: summarise progress, next steps
    resp = llm(...); budget.charge(resp.usage)
```

**Graceful degradation**

- At ~80% budget, **tell the agent** ("you have 5 steps left; prioritise finishing") and switch to a cheaper model or stop exploring.
- On exhaustion, return a **partial result** with what was done and what remains; allow the user to extend the budget or continue.
- Reserve a small budget for the final answer.

**Reduce the variance**

- Find the expensive outliers in traces (long tool outputs, loops), then fix with truncation, compaction, loop detection and better tools.
- Route by task complexity; estimate cost up front and ask for approval above a threshold.

**Governance:** per-user and per-tenant quotas, spend alerts and dashboards, prevent denial-of-wallet attacks (rate limits, auth), and log budget stops as a metric.
