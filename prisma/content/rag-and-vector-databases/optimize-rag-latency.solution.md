**Measure first:** trace every span (query rewrite, embedding, retrieval, rerank, prompt build, LLM time to first token, generation, post-checks) and report p50, p95, p99. Optimise the largest spans.

**Typical savings**

| Area | Actions |
|---|---|
| **LLM generation (usually largest)** | **Stream** tokens; smaller or faster model for simple questions (routing); shorter prompts and answers (`max_tokens`); prompt caching of the stable prefix; speculative decoding if self-hosted |
| **Context size** | Fewer, better chunks (top 3 to 6 after reranking); compress or trim chunks; time to first token scales with prompt length |
| **Reranking** | Fewer candidates (30 instead of 100), lighter model, GPU, truncate passages, skip when retrieval confidence is high |
| **Retrieval** | ANN index tuning (HNSW `ef_search`), in-memory index, quantised vectors, regional proximity, metadata pre-filters |
| **Query side** | Cache embeddings and frequent results; skip query rewriting unless needed; run rewriting and other steps in parallel |
| **Pipeline structure** | Run independent steps concurrently (history load, embedding, BM25 + vector search in parallel); move guardrails/moderation to run on the stream or in parallel |
| **Caching** | Semantic cache for frequent questions (with freshness and permission-aware keys) |
| **Infra** | Connection pooling, keep-alive, warm instances, avoid cold starts |

```python
async def retrieve(q):
    dense, sparse = await asyncio.gather(vector_search(q, 50), bm25_search(q, 50))   # parallel
    return fuse(dense, sparse)
```

**Quality guardrails:** compare recall@k and answer quality on the eval set after every change; set a **latency budget per stage** and alert when a stage exceeds it; load-test because tail latency appears under concurrency.
