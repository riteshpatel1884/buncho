```python
import json
from openai import OpenAI
client = OpenAI()

def get_weather(city: str) -> dict:
    return {"city": city, "temp_c": 21}

TOOLS = {"get_weather": get_weather}
SCHEMAS = [{
    "type": "function",
    "function": {
        "name": "get_weather", "description": "Current weather for a city.",
        "parameters": {"type": "object",
                       "properties": {"city": {"type": "string"}},
                       "required": ["city"], "additionalProperties": False},
    },
}]

def run_tool(call):
    name = call.function.name
    try:
        if name not in TOOLS:
            return f"error: unknown tool '{name}'"
        args = json.loads(call.function.arguments or "{}")     # may be malformed
        result = TOOLS[name](**args)                            # TypeError if bad args
        return json.dumps(result)[:4000]                        # cap size
    except Exception as e:
        return f"error: {type(e).__name__}: {e}"                # let the model recover

def agent(goal, max_steps=8):
    messages = [{"role": "system", "content": "Use tools when needed. Be concise."},
                {"role": "user", "content": goal}]
    for step in range(max_steps):
        resp = client.chat.completions.create(
            model="gpt-4o-mini", messages=messages, tools=SCHEMAS)
        msg = resp.choices[0].message
        if not msg.tool_calls:
            return msg.content                                  # model chose to answer
        messages.append(msg)                                    # assistant message with tool_calls
        for call in msg.tool_calls:                             # may be several in parallel
            messages.append({"role": "tool", "tool_call_id": call.id,
                             "content": run_tool(call)})
    return "Stopped: step budget exhausted."
```

**Key points**

- **Dispatch table** (`name -> function`) instead of `eval`; unknown tools are an error string, not an exception.
- **Validate arguments** (JSON parse, schema or Pydantic) because models can emit bad arguments.
- **Errors become observations** so the model can retry or change course; unrecoverable ones should abort.
- Handle **parallel tool calls** and always return one `tool` message per `tool_call_id`.
- **Budgets:** step limit here; add token/cost/time limits and a repeated-call detector for loops.
- **Safety:** allow-list tools, require confirmation for side-effecting ones, log every call, make writes idempotent.
