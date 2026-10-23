**Know the drivers:** cost = input tokens x input price + output tokens x output price (output is usually several times more expensive). Latency = time to first token (grows with input size) + output tokens x time per token.

**Reduce input tokens**

- Remove redundant instructions and verbose examples; use fewer, better few-shot examples.
- Retrieve only the top relevant chunks (RAG) instead of whole documents; trim history (summarise old turns).
- Use compact formats (short field names, no pretty-print JSON).

**Reduce output tokens**

- Ask for concise output, set `max_tokens`, request structured fields instead of prose, avoid chain-of-thought where not needed.

**Cache and reuse**

- **Prompt caching:** put the stable prefix (system prompt, tools, documents) first and the variable part last.
- Cache full responses for repeated questions (watch freshness and privacy).

**Choose the right model and calls**

- Route simple tasks to smaller or faster models; escalate hard ones.
- Batch offline work (batch APIs are often about 50% cheaper).
- Parallelise independent calls; stream output to improve perceived latency.
- Avoid unnecessary chain steps; merge steps where quality holds.

```python
system = STABLE_INSTRUCTIONS            # identical on every request: cacheable prefix
messages = [{"role": "user", "content": f"{retrieved_chunks[:3]}\n\nQ: {question}"}]   # variable part last
```

**Protect quality:** compare variants on a fixed eval set (accuracy, format validity, user ratings) and change one thing at a time; track tokens per request, cost per task and p95 latency.
