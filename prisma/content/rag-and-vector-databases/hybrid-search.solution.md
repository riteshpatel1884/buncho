**Dense (vector) search** captures meaning ("car" matches "automobile") but is weak on **exact tokens**: product codes, error numbers, names, acronyms, rare jargon.

**Sparse (BM25 / keyword) search** matches exact terms and rare words well but misses synonyms and paraphrases.

**Hybrid search:** run both and **fuse** the results, getting semantic recall plus exact-match precision.

**Fusion methods**

- **Reciprocal Rank Fusion (RRF):** score = sum over lists of `1 / (k + rank)`, with `k` about 60. No score normalisation needed; robust default.
- **Weighted score fusion:** normalise scores (min-max or z-score) and combine `alpha * dense + (1 - alpha) * sparse`; tune `alpha` on an eval set.

```python
def rrf(result_lists, k=60, top=20):
    score = {}
    for results in result_lists:                      # each: list of doc ids, best first
        for rank, doc in enumerate(results, start=1):
            score[doc] = score.get(doc, 0) + 1 / (k + rank)
    return sorted(score, key=score.get, reverse=True)[:top]

candidates = rrf([bm25_search(q, 50), vector_search(q, 50)])
```

**Why it is better:** queries like "error E4021 on login" or "GDPR Article 17" need exact matches; conceptual questions need semantics. Real traffic has both, and hybrid is more robust than either, especially on domain-specific vocabulary.

**Practical tips:** many vector databases and engines (Elasticsearch/OpenSearch, Weaviate, Qdrant, pgvector with full-text) support it natively; follow with a **reranker**; evaluate recall@k for each retriever separately and fused.
