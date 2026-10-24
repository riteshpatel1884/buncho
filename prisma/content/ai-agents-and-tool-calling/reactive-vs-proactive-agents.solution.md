| | Reactive agent | Proactive agent |
|---|---|---|
| **Trigger** | Responds to a user request or input | Initiates on its own: schedule, event, monitored condition, goal |
| **Interaction** | Request then response | Observes, decides, acts, notifies |
| **Examples** | Chat assistant, coding assistant answering a prompt, support bot | Monitoring agent that opens a ticket when error rates spike; assistant that prepares your morning brief; agent that rebalances inventory |
| **Autonomy** | Lower; human drives | Higher; acts without being asked |
| **Risk** | Lower | Higher: unattended actions, noise, cost |

**Proactive pattern**

```python
while True:
    events = poll_sources()                     # alerts, emails, metrics, calendar
    for e in events:
        if worth_acting(e):                     # cheap filter first, LLM only when needed
            plan = agent.plan(e)
            if plan.risk == "high":
                ask_human(plan)                 # approval gate
            else:
                agent.execute(plan)
                notify_user(plan, result)
    sleep(interval)
```

**Extra engineering for proactive agents**

- **Triggers and scheduling:** cron, webhooks, event streams, watchers; deduplicate events.
- **Relevance filtering** to avoid acting on noise and burning tokens.
- **Guardrails:** scoped permissions, budgets, rate limits, approval for risky actions, kill switch.
- **Idempotency and state** so repeated triggers do not repeat actions.
- **Notification and transparency:** tell the user what it did and why; allow undo.
- **Monitoring and evaluation** for false positives (needless actions) and misses.

**Choose by trust:** start reactive, then proactive with suggestions only, then autonomous actions in low-risk domains as evidence accumulates.
