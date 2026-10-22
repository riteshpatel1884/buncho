Your LLM API client sometimes fails with rate-limit (429), timeout and 5xx errors.

Write a decorator `retry(max_attempts, base_delay, max_delay, exceptions)` that retries with exponential backoff and jitter, and re-raises the last error when attempts run out. Explain what you would and would not retry.
