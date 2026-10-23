**Cause:** old turns and retrieved context from the previous topic stay in the prompt and bias the answer, and follow-up questions are retrieved with stale context (or without any).

**Approach**

1. **Detect the switch:** an intent/topic classifier on each message; embedding similarity between the new message and a topic centroid or recent turns (low similarity means a switch); or ask the LLM "Is this a new topic? yes/no".
2. **Rewrite the query:** turn follow-ups into standalone questions ("What about the cost?" becomes "What is the shipping cost for order 123?") using only the relevant history; if it is a new topic, use the message alone.
3. **Reset or scope context on a switch:** drop retrieved passages and tool state from the old topic, keep user-level facts (name, account) and a one-line summary of the earlier topic.
4. **Support returning:** keep per-topic memory so "back to billing" restores it.
5. **Ask when unsure:** "Are you asking about shipping now?"

```python
def is_switch(new_msg, recent_msgs, embed, thr=0.35):
    sim = cosine(embed(new_msg), embed(" ".join(recent_msgs[-3:])))
    return sim < thr

if is_switch(msg, history, embed):
    ctx = {"facts": user_facts, "retrieved": []}      # fresh topic context
```

**Evaluate** with multi-topic scripted dialogues and track answer relevance after a switch.
