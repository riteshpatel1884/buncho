**Definition:** splitting a complex task into **several focused prompts**, where each step's output becomes input to the next (optionally with code, tools or checks in between).

**Why chain**

- Each prompt is simpler, so more accurate and easier to debug.
- You can use different models per step (small for extraction, large for writing).
- Intermediate outputs can be validated, logged and corrected.
- Enables branching, loops, parallel steps and human review.

**Trade-offs:** more calls (cost and latency), error propagation, more engineering. If a single prompt works reliably, keep it.

**Example chain**

```text
1. Extract (small model): thread -> {customer, product, issue, sentiment, order_id}   (JSON, validated)
2. Classify (small model): issue -> {category, priority}
3. Retrieve (code): policy snippets for the category
4. Draft (large model): extracted facts + policy snippets -> reply draft
5. Check (small model or rules): reply cites policy, no promises beyond policy, correct tone
6. If check fails -> revise once with the critique; else output
```

```python
def handle(thread):
    facts = validate(extract(thread))                  # step 1 with schema validation
    meta = classify(facts)
    policy = retrieve_policy(meta["category"])
    reply = draft(facts, policy)
    issues = check(reply, policy)
    if issues:
        reply = revise(reply, issues)
    return {"ticket": {**facts, **meta}, "reply": reply}
```

**Design tips:** define a typed contract between steps; validate outputs and fail fast; keep steps single-purpose; add retries and fallbacks; evaluate each step and the whole chain; log intermediate values.
