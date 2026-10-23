**Prompting (soft control)**

- Say what you want: "Answer in at most 3 sentences", "Use 5 bullets", "No preamble, no recap".
- Give a short example answer (few-shot); models copy the length of examples.
- Assign a style in the system prompt (concise support agent).
- Ask for the answer first, with detail only on request.

**API parameters (hard control)**

- `max_tokens` caps output tokens, but can cut a sentence in the middle, so combine it with a prompt instruction so the model plans to finish within the limit.
- `stop` sequences end generation at a delimiter.
- Lower temperature and use `frequency_penalty` / `presence_penalty` to reduce rambling and repetition.

**Structure**

- Request a schema with bounded fields (`summary` of at most 200 characters).
- Two-step: generate, then compress with "shorten to 50 words, keep all numbers".

**Training-level:** fine-tune or preference-tune on concise answers (length penalties in RLHF counter the verbosity bias of reward models).

```python
resp = client.messages.create(
    model=MODEL, max_tokens=150,
    system="You are a support agent. Reply in at most 3 sentences. No preamble.",
    messages=[{"role": "user", "content": question}],
)
```

**Check:** log average tokens per response per intent, and verify that shortening does not drop required content.
