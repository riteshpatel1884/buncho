**Cause:** the LLM is stateless. Your app resends history each turn; if you truncate to fit the window (or the model attends poorly to the middle), early facts vanish.

**Fixes**

1. **Keep a rolling summary** of older turns plus the last N turns verbatim.
2. **Extract durable state** into a structured memory (name, order id, preferences, decisions) and inject it into every prompt, instead of relying on raw history.
3. **Long-term memory with retrieval:** store past messages or facts in a vector store; retrieve the relevant ones for the current turn.
4. **Pin important content:** system prompt and key facts at the start; repeat critical constraints near the end.
5. **Token budgeting:** count tokens, trim the least valuable content first (tool outputs, boilerplate).
6. **Cache the stable prefix** to keep cost and latency down.

```python
def build_messages(state, summary, recent, user_msg):
    system = f"You are a support agent.\nKnown facts: {state}\nConversation so far: {summary}"
    return [{"role": "system", "content": system}, *recent[-6:], {"role": "user", "content": user_msg}]

# after each turn: update state with an LLM extraction call, and re-summarise when history exceeds a threshold
```

**Test:** scripted 30-turn conversations that check recall of early facts; monitor how often users repeat themselves.
