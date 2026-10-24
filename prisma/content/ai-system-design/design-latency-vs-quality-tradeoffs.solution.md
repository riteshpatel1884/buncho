**Step 1: define the budget.** Set user-perceived targets per interaction type: time to first token (TTFT), total time, and the quality bar. Chat tolerates a few seconds with streaming; autocomplete needs under 300 ms; voice needs about 1 s; batch tasks can take minutes.

**Where latency comes from:** network, queueing, retrieval (vector search, reranking), **prefill** (input length), **decode** (output length x per-token time), tool calls, multiple sequential LLM calls (agents/chains), guardrail checks.

**Levers (usually in this order)**

1. **Perceived latency:** **stream** tokens, show progress, return partial results, optimistic UI.
2. **Do less work:** shorter prompts and outputs, trim retrieved context, fewer reranked chunks, cache (prompt/prefix, semantic, response, embeddings).
3. **Parallelise:** run retrieval, guardrails, tool calls and independent LLM calls concurrently; speculative execution.
4. **Right-size the model:** **routing/cascades**: small fast model by default, escalate to a large model on low confidence or hard queries; distil or fine-tune small models for narrow tasks.
5. **Inference optimisation:** quantisation, speculative decoding, continuous batching, prefix caching, GPU choice, co-location.
6. **Adaptive effort:** reasoning/"thinking" budgets chosen per request; fewer self-consistency samples for easy queries.
7. **Asynchronous patterns:** accept quickly, finish in the background, notify on completion.

**Making the trade-off explicit**

```python
def route(query, features):
    if features.is_simple or features.latency_budget_ms < 800:
        return "small-fast-model"
    return "large-model-with-reasoning"          # escalate when the quality gain justifies the wait
```

- Measure the **quality-latency Pareto frontier** on an eval set: plot quality vs p95 latency and cost for each configuration and choose operating points per use case.
- Use **tail latency (p95/p99)**, not averages; set timeouts and degrade (fallback to cached/smaller answers) when exceeded.
- A/B test: users often prefer slightly worse but much faster answers (and vice versa for high-stakes tasks).

**Principle:** spend latency where it buys measurable quality, and hide or eliminate it everywhere else.
