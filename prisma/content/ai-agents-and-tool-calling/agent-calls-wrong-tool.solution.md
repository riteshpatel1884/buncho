**Root causes**

1. **Indistinguishable descriptions.** "Search orders" vs "Find an order" tell the model nothing about when to use which, so choice is close to random. Descriptions are the model's only documentation.
2. **Overlapping tools.** `cancel_order` is described as "cancel *or refund*", so it duplicates `refund_order`.
3. **No tool for the real intent.** The user asked for *status/tracking*, and no tool says it returns tracking. The agent drifted to whatever remained.
4. **Ambiguous empty results.** `[]` and `{}` do not say "not found", "bad id format" or "permission denied", so the agent guesses the next step instead of asking the user.
5. **Destructive tools with no safeguards.** `cancel_order` and `refund_order` have real-world side effects but no confirmation step, no authorisation check and no idempotency. An unrelated failure ("failed") led to a *different* destructive call.
6. **Weak error messages.** `"failed"` gives no actionable reason.
7. **Prompt gives no policy:** nothing about read-only vs write actions, asking before acting, or stopping after repeated failures.
8. **No loop guard:** the agent chained calls without a limit.

**Fixes**

```json
[
  {"name": "get_order_status",
   "description": "READ-ONLY. Look up one order by its exact order id (digits, e.g. 8841). Returns status, carrier and tracking. Use when the customer asks where an order is or what its status is.",
   "parameters": {"order_id": {"type": "string", "pattern": "^[0-9]{4,10}$"}}},
  {"name": "search_orders_by_customer",
   "description": "READ-ONLY. List recent orders for the signed-in customer. Use only when the customer does not know the order id.",
   "parameters": {"limit": {"type": "integer", "maximum": 10}}},
  {"name": "request_refund",
   "description": "WRITE. Refund an order. Only call after the customer has explicitly confirmed in the conversation. Never use for status questions.",
   "parameters": {"order_id": "string", "confirmation_token": "string"}}
]
```

- Merge `cancel`/`refund` or give each distinct, non-overlapping semantics; separate **read** and **write** tools and say so in the description.
- Return explicit results: `{"found": false, "reason": "no_order_with_id", "hint": "ask the customer to check the id"}`, and structured errors with a reason code.
- Enforce authorisation in code (the order belongs to this customer), validate arguments with a schema, require a **confirmation token** issued only after a user "yes", and make writes idempotent.
- System prompt: "Prefer read-only tools. Never change an order unless the customer asked for it and confirmed. If a lookup returns nothing, ask the customer for details instead of trying other tools. Stop after 3 tool errors and offer a human handoff."
- Limit maximum tool calls per turn; for high-risk tools use human approval.

**Testing and monitoring**

- Build a test set of 50 to 100 intents (status, cancel, refund, missing order, wrong id, ambiguous) with the expected tool and arguments; measure **tool-selection accuracy** and **unsafe action rate** (any write without confirmation must be 0).
- Replay the failing trace as a regression test.
- In production log every tool call with arguments and outcome, alert on writes without a confirmation event, and review samples of low-confidence traces.
