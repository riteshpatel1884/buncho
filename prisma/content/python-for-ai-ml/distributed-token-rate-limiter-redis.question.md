The provider limits you to a budget of **tokens per minute**, and a request costs roughly `prompt_tokens + max_output_tokens`.

1. Write a token bucket where each request **consumes its estimated token cost** (not 1 unit).
2. Run the application on many servers sharing one quota. Make the limiter **distributed** with Redis so that two servers can never both spend the same tokens.
3. Explain how you reconcile the estimate with the actual usage.
