**No, but the boundary moved.** Long context is a strong option when the data is small enough; RAG remains necessary when it is large, dynamic, permissioned or queried often.

**Comparison**

| | Long context (stuff it all) | RAG |
|---|---|---|
| Setup | None | Ingestion, index, retriever |
| Corpus size | Up to the window (and quality drops near limits) | Millions of documents |
| Per-query cost and latency | Pay for all tokens each time (mitigated by prompt caching); time to first token grows with length | Small prompt; retrieval overhead |
| Quality | Whole-document reasoning, cross-references, no retrieval misses; but **lost in the middle**, distraction by irrelevant text, degrading recall at length | Depends on retrieval quality; can miss evidence or synthesis across many pieces |
| Freshness / updates | Rebuild the prompt | Update the index |
| Access control | Whole prompt visible to the model | Filter per user |
| Citations | Possible but harder | Natural |
| Aggregation over the whole corpus | Possible if it fits | Hard (need GraphRAG/map-reduce) |

**Decision framework**

1. **Size:** corpus well below the window (say a few documents or a single contract or codebase slice) and queried a few times -> long context.
2. **Query volume:** many queries over the same corpus -> RAG, or long context with **prompt caching** if the corpus is stable and small.
3. **Dynamic or permissioned data** -> RAG.
4. **Task type:** whole-document understanding, summarisation, cross-section reasoning -> long context (or map-reduce); pinpoint facts in a big corpus -> RAG.
5. **Quality test:** run both on your questions; measure accuracy, latency and cost.

**Hybrid is common:** retrieve a generous set (20 to 50 chunks or whole relevant documents) and put them in a long window, or let an agent load whole files on demand. Prompt caching changes the economics for repeated use of a stable prefix.

```text
cost_long ~ n_queries * context_tokens      (reduced to ~0.1x on cached prefix reads)
cost_rag  ~ index_cost + n_queries * (retrieval + ~3k prompt tokens)
```
