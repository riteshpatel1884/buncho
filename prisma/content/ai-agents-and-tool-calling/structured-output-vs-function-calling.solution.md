| | Structured output | Function calling (tool use) |
|---|---|---|
| Purpose | Make the **final response** conform to a schema | Let the model **request an action** from your code |
| Who consumes it | Your application (parse, store, display) | Your tool executor |
| Flow | One call: model returns JSON, done | Loop: model returns a call, you run it, return the result, model continues |
| Side effects | None (data only) | Typically yes (query, send, write) |
| Schema describes | The shape of the answer | The arguments of a function |
| Typical use | Extraction, classification, form filling, UI data | Agents, retrieval, APIs, calculations |

```python
# structured output: the answer itself is the schema
class Invoice(BaseModel):
    vendor: str; total: float; due_date: str
invoice = client.parse(model=MODEL, response_format=Invoice, messages=[...])

# function calling: the model asks you to do something
tools = [{"name": "lookup_vendor", "input_schema": {...}}]
```

**They overlap:** providers implement both with schema-constrained decoding, and a common trick is to define a "tool" whose arguments are the schema you want (forced tool call) to get structured output. Newer APIs offer both natively.

**Choose**

- Need data in a shape, no external action -> **structured output**.
- Need the model to fetch data or act, possibly several times -> **function calling**.
- Agent whose final reply must also match a schema -> use **both**: tools during the loop, structured output at the end.

Either way: validate output, handle refusals and truncation, and keep schemas small and well described.
