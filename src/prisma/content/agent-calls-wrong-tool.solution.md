## Diagnosis

The model chooses tools using only their names, descriptions and schemas, so read them as the model does.

1. **Ambiguous descriptions.** Two tools both say "Search for information", so the choice is nearly arbitrary.
2. **Unhelpful tool output.** `{"results": []}` gives no guidance. The agent retries the same call because nothing tells it that it chose the wrong tool.
3. **No loop protection.** Repeating an identical failing call is not caught.
4. **Missing routing guidance** in the system prompt about which tool serves which intent.

## Fixes

**Make tools distinguishable.** State what each does, when to use it, and when *not* to:

```json
{
  "name": "search_knowledge_base",
  "description": "Search company policies and help articles (refunds, shipping, returns, warranties). Use for general 'how does X work' questions. Do NOT use for a specific customer's order."
}
```

```json
{
  "name": "search_orders",
  "description": "Look up a specific customer's orders by order ID or email. Requires an identifier. Do NOT use for policy questions."
}
```

**Make errors actionable.** Return messages such as `No orders matched. This tool only searches orders by ID or email. For policy questions use search_knowledge_base.`

**Constrain the agent loop.** Set a maximum number of steps, detect repeated identical calls, and fall back or escalate instead of looping.

**Reduce the choice.** Fewer tools, or route by intent first (a cheap classifier or router) and expose only the relevant tool set. Use strict schemas and enums for arguments.

**Protect side effects.** `issue_refund` changes real state. Require confirmation, validate arguments server-side (amount limits, order ownership), and require human approval above a threshold. Never rely on the prompt alone.

## Prevent regressions

Build a trace-based evaluation set of user requests with the expected tool sequence. Track tool-selection accuracy, steps per task, and task success, and run it whenever descriptions, prompts or models change.

## Trade-offs

Rich descriptions cost tokens on every call. Routing adds latency and another component that can be wrong, but it usually improves reliability.
