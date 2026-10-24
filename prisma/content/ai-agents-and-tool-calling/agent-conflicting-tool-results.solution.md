**Why they conflict**

- **Staleness / sync lag:** one system updated, the other not yet.
- **Different definitions:** "plan" in CRM (contracted) vs billing (currently charged).
- **Data quality errors** or duplicate records.
- **Scope/time differences:** different accounts, regions or dates.
- **Tool bug or partial result** (pagination, truncation).

**Make reconciliation explicit (do not leave it to chance)**

1. **Define source-of-truth rules per field:** "billing is authoritative for plan and payment; CRM for contacts." Encode them in the prompt **and** in code (a resolver).
2. **Return metadata from tools:** `source`, `timestamp`, `confidence`, so the agent can prefer the newest or most authoritative.
3. **Cross-check important facts** by calling a second source and compare in code before presenting.
4. **Conflict policy for the model:** if sources disagree and the rule does not decide, **state the discrepancy, cite both, avoid guessing**, and escalate or ask the user to confirm when the decision matters.
5. **Deterministic resolution where possible:** majority vote, latest-timestamp-wins, or priority order, implemented outside the LLM.
6. **Fix at the root:** log conflicts, route them to data owners, and add sync/reconciliation jobs.

```python
PRIORITY = {"plan": ["billing", "crm"], "email": ["crm", "billing"]}

def resolve(field, observations):          # [{"source": "crm", "value": "Pro", "ts": ...}, ...]
    for src in PRIORITY[field]:
        for o in observations:
            if o["source"] == src:
                conflicts = {x["value"] for x in observations} - {o["value"]}
                return {"value": o["value"], "source": src, "conflict": bool(conflicts)}
```

**Testing:** build test cases with injected conflicts (stale and fresh values, missing data) and check the agent's behaviour: correct resolution, honest disclosure, no confident guessing. Track "conflict rate" as a data-quality metric.
