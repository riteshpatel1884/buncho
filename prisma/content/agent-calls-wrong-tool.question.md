A customer support agent has three tools:

| Tool | Description |
|---|---|
| `search_orders` | "Search for information" |
| `search_knowledge_base` | "Search for information" |
| `issue_refund` | "Refund a customer" |

For policy questions like *"What is your refund policy?"* the agent calls `search_orders` again and again. A trace looks like this:

~~~text
step 1  tool=search_orders  args={"query": "refund policy"}  -> {"results": []}
step 2  tool=search_orders  args={"query": "refund policy"}  -> {"results": []}
step 3  tool=search_orders  args={"query": "return policy"}  -> {"results": []}
step 4  final answer: "I couldn't find that information."
~~~

Diagnose the problem and describe how you would fix it and prevent regressions.
