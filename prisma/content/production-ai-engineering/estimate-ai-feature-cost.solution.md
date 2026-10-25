**Formula (API-based)**

$$\text{cost/month} = \text{requests} \times \big(t_{in}\,p_{in} + t_{cached}\,p_{cached} + t_{out}\,p_{out}\big) + \text{other components}$$

**Step 1: usage drivers:** active users, requests per user per day, peak vs average, growth. **Step 2: tokens per request:** system prompt, retrieved context (top-k x chunk size), history, user text, and output length; for agents **multiply by the number of LLM calls/steps** (often 3 to 10x). Measure from a prototype on real data; do not guess.

**Worked example (illustrative prices)**

- 50,000 requests/day. Input 3,000 tokens (of which 2,000 are a cacheable shared prefix), output 400 tokens.
- Assume $3 per 1M input, $0.30 per 1M cached input, $15 per 1M output tokens.
- Per request: uncached input 1,000 x $3/1M = $0.0030; cached 2,000 x $0.30/1M = $0.0006; output 400 x $15/1M = $0.0060. Total = **$0.0096**.
- Per month (30 days): 1.5M requests x $0.0096 = **about $14,400**.
- Without caching: input 3,000 x $3/1M = $0.009, total $0.015, so about $22,500/month. Caching saves roughly 36%.

**Step 3: add the non-LLM costs:** embeddings and re-indexing, vector DB, reranker, guardrail/moderation calls, LLM-judge evaluation, speech/vision models, observability storage, retries and failed requests, human review, engineering time.

**Step 4: self-hosted alternative:** (GPU $/hour x GPUs) / (tokens per hour at target utilisation); include idle capacity, redundancy and ops. Compare per 1M tokens against API pricing; break-even depends on sustained utilisation.

**Step 5: sensitivity and scenarios:** vary tokens/request, traffic growth, model choice, cache hit rate; model best/expected/worst cases. Output tokens and agent loops are the usual surprises.

**Step 6: unit economics:** cost per active user, per resolved ticket, per document; compare with revenue or savings.

**Controls:** budgets and alerts, token caps, routing to cheaper models, caching, and monitoring actual vs forecast monthly.
