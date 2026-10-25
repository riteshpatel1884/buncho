You have `async call_llm(doc) -> str` and 50,000 documents `(id, text)`. Write `process_all(docs, call_llm, concurrency=50)` that:

1. runs at most `concurrency` calls at once **without creating 50,000 tasks in memory**,
2. retries transient errors (429, 5xx, timeouts) with **exponential backoff and jitter**, but does not retry permanent errors,
3. isolates failures: one bad document never stops the run, and every failure is recorded with its error,
4. writes results as they finish and can **resume** after a crash without redoing finished documents.
