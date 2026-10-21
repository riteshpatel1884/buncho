## Where the money goes

- Input: 120,000 x 5,800 tokens = about **696M tokens/day**, which is about **$2,088/day** at $3 per 1M.
- Output: 120,000 x 420 = about **50.4M tokens/day**, about **$756/day** at $15 per 1M.
- Total is about **$2,844/day, roughly $85k/month**. About three quarters is input, even though output is priced 5x higher, because each request carries a very large prompt.

## Options and rough savings (assumptions stated)

1. **Prompt caching / trimming the 1,900-token system prompt** that is identical on every request. If cached input is billed at about 10% of the normal price, that part of the input cost falls by around 90%. Also shorten the prompt.
2. **Trim retrieved context**: top_k 8 to 4 and drop low-score chunks. This could remove 1,000 to 1,500 input tokens, about 20% of input cost, with a small quality risk to test.
3. **Route the top four intents (62% of traffic)** to a small model, falling back to the large model on low confidence. If the small model costs about a tenth, this alone can cut the bill by roughly half.
4. **Response caching** for near-identical FAQ-style questions (shipping times, refund policy), with a TTL and invalidation when policies change. Never cache answers that contain personal data (for example order status).
5. Cap output length and ask for concise answers on simple intents.

## Protect quality

- Build a labelled eval set per intent and compare the small model against the large one offline first.
- Run a shadow test, then a 5% A/B test, and track thumbs-up **per intent**, not just overall.
- Set an automatic stop: if overall thumbs-up drops more than 2 points, or any routed intent drops more than a few points, route back to the large model.

## Roll out and monitor

Ship one change at a time behind a flag, starting with the lowest-risk ones (prompt caching and trimming). Alert on cost per request, router fallback rate, cache hit rate and thumbs-up by intent, and keep a one-switch rollback.