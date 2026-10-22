Your company has ten services that call LLMs, each with copy-pasted provider code. Design an internal Python package, `llmkit`, that they all use.

Cover:
1. the public API and provider abstraction,
2. reliability (retries, timeouts, rate limits, fallbacks),
3. observability and cost control,
4. caching, structured output and testing,
5. sync and async support, and how you would roll it out.
