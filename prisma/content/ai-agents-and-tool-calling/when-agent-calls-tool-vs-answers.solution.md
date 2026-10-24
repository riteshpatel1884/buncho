**How the decision happens:** it is not a separate module. At each step the model **generates the next tokens**, and those can be a normal answer or a tool call. The choice is driven by:

- the **user request** and conversation so far,
- the **tool descriptions** (what each tool can do and when to use it),
- the **system prompt policy** ("search for anything time-sensitive"),
- the model's learned sense of its **own uncertainty** (imperfect) and training on tool-use data.

**Typical errors**

- **Under-calling:** answers from memory on current prices, user data, calculations; hallucination.
- **Over-calling:** searches for trivial facts, wasting latency and cost, or loops.

**Steering**

1. **Write explicit policy:** "Use `search` for events after 2024, prices, or anything about this user's account. Answer directly for general knowledge and explanations. Never do arithmetic yourself; use `calculator`."
2. **Good tool descriptions** with when-to-use and when-not-to-use.
3. **Force or restrict** via API options: `tool_choice` auto / required / specific tool / none.
4. **Routing step:** a cheap classifier decides "needs retrieval or tools?" before the main agent runs.
5. **Examples:** few-shot cases of correct choices in both directions.
6. **Verification:** check answers that cite facts for support; require citations for tool-derived claims.
7. **Evaluate** the decision itself: labelled queries with expected "tool / no tool" and measure precision and recall; track unnecessary-call rate and ungrounded-answer rate.

```python
resp = client.messages.create(model=MODEL, tools=tools, tool_choice={"type": "auto"}, ...)
# tool_choice={"type": "any"} forces some tool call; {"type": "tool", "name": "search"} forces that tool
```
