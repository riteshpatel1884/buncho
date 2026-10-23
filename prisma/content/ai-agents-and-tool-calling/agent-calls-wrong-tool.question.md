A customer-support agent has these tools, shown exactly as the model sees them:

```json
[
  {"name": "search_orders", "description": "Search orders.", "parameters": {"query": "string"}},
  {"name": "find_order",    "description": "Find an order.",  "parameters": {"order_id": "string"}},
  {"name": "cancel_order",  "description": "Cancel or refund an order.", "parameters": {"order_id": "string"}},
  {"name": "refund_order",  "description": "Refund an order.", "parameters": {"order_id": "string"}}
]
```

System prompt: `You are a helpful support agent. Use the tools to help the customer.`

Trace of a failing conversation:

```text
User: Where is my order 8841?
Agent -> search_orders(query="8841")        => []
Agent -> find_order(order_id="8841")        => {}
Agent -> cancel_order(order_id="8841")      => {"status": "error", "message": "failed"}
Agent -> refund_order(order_id="8841")      => {"status": "ok", "refunded": 59.00}
Agent: I have refunded your order.
```

The customer only wanted to know where the order was. In other conversations the agent picks `search_orders` when it should use `find_order`, and vice versa.

1. Find every root cause.
2. Fix the tools, prompt and code.
3. Explain how you would test and monitor the fix.
