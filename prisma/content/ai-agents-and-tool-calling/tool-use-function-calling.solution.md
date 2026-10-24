**Idea:** you describe functions (name, description, JSON schema of arguments) to the model. When a request needs one, the model **outputs a structured call** instead of text. **Your code executes it** and returns the result, and the model uses it to continue. The model never runs code itself.

**Flow**

```text
1. App sends: messages + tool definitions
2. Model replies: tool_call {name: "get_weather", arguments: {"city": "Pune"}}
3. App validates args, runs get_weather("Pune")
4. App sends back: tool_result {"temp_c": 29, "sky": "clear"}
5. Model writes the final answer (or makes more tool calls)
```

```python
tools = [{"name": "get_weather", "description": "Current weather for a city.",
          "input_schema": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]}}]

resp = client.messages.create(model=MODEL, tools=tools, max_tokens=500,
                              messages=[{"role": "user", "content": "Do I need an umbrella in Pune?"}])
for block in resp.content:
    if block.type == "tool_use":
        result = get_weather(**block.input)      # your code runs it
```

**Why it enables agents:** it gives the model **actions** (search, databases, code, APIs) and **grounded observations**, turning text prediction into a perceive-act loop. It also gives reliable machine-readable calls rather than parsing free text.

**What can go wrong**

- Wrong tool or wrong arguments (ambiguous descriptions, hallucinated parameters).
- Missing validation, unsafe side effects, injection through tool outputs.
- Too many tools degrade selection; large outputs flood the context.

**Good practice:** clear descriptions, strict schemas, validate and authorise in code, return concise structured results and helpful errors, limit steps.
