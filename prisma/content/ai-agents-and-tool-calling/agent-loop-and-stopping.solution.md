**The loop:**

```text
observe context -> model decides -> (tool call?) -> execute tool -> append result -> repeat
                                        |
                                   (final answer) -> stop
```

```python
def run(goal, llm, tools, limits):
    ctx, steps, spent = [goal], 0, 0
    while True:
        reply = llm(ctx, tools)
        steps += 1; spent += reply.cost
        if not reply.tool_calls:
            return reply.text, "completed"                       # 1. model says done
        if steps >= limits.max_steps:        return partial(ctx), "step_limit"
        if spent >= limits.max_cost:         return partial(ctx), "budget"
        if time() - start > limits.deadline: return partial(ctx), "timeout"
        if looping(ctx):                     return partial(ctx), "loop_detected"
        for call in reply.tool_calls:
            ctx.append(run_tool(call))
        if user_cancelled():                 return partial(ctx), "cancelled"
```

**Stop conditions**

1. **Model-declared completion:** it produces a final answer with no tool calls (or calls a `finish` tool).
2. **Success check by the harness:** tests pass, schema validates, goal predicate satisfied.
3. **Hard limits:** max steps/iterations, token or cost budget, wall-clock timeout.
4. **No-progress detection:** repeated identical tool calls or states, oscillating plans.
5. **Needs input or approval:** pauses for a human (human-in-the-loop) or asks a clarifying question.
6. **Errors:** unrecoverable failure, repeated tool errors.
7. **External cancel** by the user or system.

**Design tips**

- Do not rely only on the model's own claim of success for important tasks; **verify** with an independent check.
- Always have hard limits, and on hitting one return a **useful partial result** and what remains.
- Log the stop reason; track it as a metric (high step-limit rate means a prompt/tool problem).
