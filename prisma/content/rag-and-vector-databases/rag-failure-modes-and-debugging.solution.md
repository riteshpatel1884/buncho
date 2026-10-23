**Failure modes by stage**

| Stage | Failure | Symptom |
|---|---|---|
| Ingestion | Bad parsing, lost tables, missing docs, stale index | Answer exists in the source but was never indexed correctly |
| Chunking | Chunks split mid-idea or too large | Partial or diluted evidence |
| Embedding | Wrong model for domain or language | Semantically odd matches, jargon missed |
| Retrieval | Low recall, no filters, duplicates | Right chunk absent or ranked low |
| Reranking / context | Too many chunks, wrong order, "lost in the middle" | Model uses the wrong or an incomplete passage |
| Generation | Ignores context, adds outside facts, wrong synthesis | Hallucination, contradiction with sources |
| Query | Ambiguous or follow-up question without history | Irrelevant retrieval |
| Safety / access | Wrong permissions, injected text in documents | Leakage or hijacked answers |
| Operations | Latency spikes, embedding/model drift | Timeouts, quality decline |

**Debugging process**

1. **Log everything per request:** query and rewrite, filters, retrieved ids and scores, reranked order, final prompt, answer, citations, latency.
2. **Classify 50 to 100 bad answers** with a checklist:
   - Is the answer in the corpus? (no: content gap)
   - Is the right chunk indexed intact? (no: ingestion/chunking)
   - Was it retrieved in top-k? (no: retrieval/query/embedding)
   - Was it ranked high and put in the prompt? (no: rerank/context)
   - Did the model use it faithfully? (no: generation)
3. **Fix the dominant class first**, measuring recall@k and faithfulness before and after.
4. **Turn each bug into a regression test** in the eval set.

```python
def diagnose(case):
    in_corpus = case.gold_chunk_id in index_ids
    retrieved = case.gold_chunk_id in [r.id for r in case.retrieved]
    in_prompt = case.gold_chunk_id in [r.id for r in case.prompt_chunks]
    return dict(in_corpus=in_corpus, retrieved=retrieved, in_prompt=in_prompt, faithful=case.faithfulness > 0.9)
```

**Monitoring:** track retrieval score distributions, "no good context" rate, thumbs-down rate and index freshness.
