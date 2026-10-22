You have an async function `call_llm(prompt) -> str`. Write `run_all(prompts, limit=10)` that:

1. runs at most `limit` calls at a time,
2. returns results **in the same order** as the prompts,
3. does not let one failed call cancel the others, and reports which ones failed,
4. supports a per-call timeout.
