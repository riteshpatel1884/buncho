**Single LLM call:** prompt in, text out. No actions, no feedback, one step.

**Workflow (chain):** your code defines a **fixed sequence** of LLM calls and tools (extract, retrieve, draft, check). Predictable and cheap, but it cannot adapt when the path is not known in advance.

**Agent:** a system where an LLM **decides dynamically what to do next** in a loop: it reasons, **calls tools** (search, code, APIs, files), **observes the results**, updates its plan, and stops when the goal is met.

```python
def agent(goal, tools, llm, max_steps=10):
    messages = [{"role": "user", "content": goal}]
    for _ in range(max_steps):
        reply = llm(messages, tools=tools)
        if not reply.tool_calls:
            return reply.text                       # model decided it is done
        for call in reply.tool_calls:
            result = tools[call.name](**call.args)  # act
            messages += [reply, {"role": "tool", "content": str(result)}]   # observe
    return "stopped: step limit"
```

**Key ingredients:** model (reasoning), **tools** (actions), **memory/context** (state), **loop** (act-observe), **goal and stop conditions**, and a **harness** (permissions, limits, logging).

| | LLM call | Workflow | Agent |
|---|---|---|---|
| Control flow | None | Code-defined | Model-decided |
| Tool use | No | Fixed places | Chosen at runtime |
| Cost / latency | Lowest | Predictable | Variable, higher |
| Reliability | High | High | Lower, needs guardrails |

**Choose an agent when** the steps are unknown in advance, tasks are open-ended (coding, research, support triage) and errors are recoverable. **Avoid it when** a fixed workflow or single call works: simpler systems are cheaper, faster and easier to test. Start simple and add autonomy only where it measurably helps.
