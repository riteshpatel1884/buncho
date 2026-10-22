Your provider allows 60 requests per minute and 90,000 tokens per minute. Implement a `TokenBucket(rate, capacity)` class with a blocking `acquire(n=1)` that is safe to call from many threads.

Explain how you would use it for both limits, how the async version differs, and what changes in a multi-process deployment.
