An LLM must return a JSON object describing a support ticket:
`{"category": "billing|bug|other", "priority": 1-5, "summary": "..."}`

Write `extract_ticket(llm, text)` that parses and validates the reply, tolerates markdown code fences, and retries up to two times by telling the model what was wrong. What would you do instead if your provider supports structured outputs?
