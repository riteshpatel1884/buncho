**Idea:** the expensive part of a long prompt is **prefill**, which computes the key/value (KV) tensors for every input token. If the same **prefix** appears in many requests (system prompt, tool definitions, documents, few-shot examples), the provider or inference engine can **store the KV state** for that prefix and reuse it instead of recomputing.

**What you save:** compute (lower **time to first token**) and money (cached input tokens are billed at a discount; exact rates, minimum prefix lengths and TTLs differ by provider, so check current docs). Output tokens are not affected.

**Rules of thumb**

- Only an **exact, contiguous prefix match** is reused. Change one token early in the prompt and everything after it is a miss.
- So order prompts **static to dynamic**: system instructions, tool schemas, reference documents, few-shot examples, then conversation history, then the new user message.
- Do not put timestamps, request IDs or user names at the top.
- Caches expire (minutes to an hour, refreshed on use) and are bounded by minimum lengths (often around 1,024 tokens).
- Some providers cache automatically; others need explicit **cache breakpoints** (and may charge a premium to write the cache).

```python
messages = [
    {"role": "system", "content": SYSTEM_PROMPT + TOOL_DOCS},     # identical on every call: cacheable
    {"role": "user", "content": f"<doc>{LONG_DOC}</doc>"},         # same doc across many questions: cacheable
    {"role": "user", "content": question},                        # changes every time: after the prefix
]
```

**Self-hosted engines** (vLLM automatic prefix caching, SGLang RadixAttention) do the same inside GPU memory using block hashes or a radix tree, and benefit from **cache-aware routing** (send requests with a shared prefix to the same replica).

**Good fits:** long system prompts, RAG over a fixed document ("chat with this PDF"), agents with big tool lists and growing history, few-shot classification. **Poor fits:** short prompts, highly unique prefixes.

**Related but different:** semantic/response caching returns a stored *answer*; prompt caching still runs the model but skips repeated prefill. Track **cache hit rate** and cached-token share to confirm the savings.
