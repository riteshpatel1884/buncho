## Where the time goes (10.1 s total)

| Span | Time | Share |
|---|---:|---:|
| LLM generation | 4,100 ms | ~41% |
| LLM first token | 2,300 ms | ~23% |
| Reranking (50 candidates, CPU) | 1,900 ms | ~19% |
| Output moderation | 700 ms | ~7% |
| Vector search | 650 ms | ~6% |
| Everything else | ~445 ms | ~4% |

Two further problems are visible: `stream: false` means the user sees **nothing for the entire 10 s**, and the pipeline is strictly **sequential**.

## Priorities

1. **Enable streaming.** Total time barely changes, but perceived latency drops to the time to first token (about 3 s here) and then keeps improving as text appears. Biggest user-visible win for the least work.
2. **Fix the reranker**: rerank 15 to 20 candidates instead of 50, use a smaller or quantised model, or move it to GPU. Expect to save roughly 1 to 1.4 s.
3. **Stop moderating after generation.** Moderate the stream in chunks, or run input checks in parallel, so it no longer adds 0.7 s at the end.
4. **Parallelise independent work**: load history and embed the query at the same time (saves about 120 ms).
5. **Cut model time**: shorten the 6,500-token prompt (it drives first-token time), lower `max_tokens`, ask for concise answers, enable prompt caching, and use a faster model for simple turns.

## Verify and guard

- Trace every span in production; track p50, p95 and p99, and **time to first token** as its own metric.
- Load-test before and after, since tail latency often appears only under concurrency.
- Set a latency budget per span (for example rerank under 400 ms) and alert when a span exceeds it.
- Check quality when you reduce candidates or shorten the prompt: compare retrieval metrics and answer quality on an eval set.