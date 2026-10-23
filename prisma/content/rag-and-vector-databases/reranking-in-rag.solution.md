**Two-stage retrieval**

1. **Retrieve** (fast, high recall): bi-encoder/vector or hybrid search returns 50 to 200 candidates.
2. **Rerank** (slower, high precision): a stronger model scores each `(query, candidate)` pair and the top 3 to 10 go to the LLM.

**Why it helps:** a bi-encoder compresses each document to one vector independently of the query, so fine-grained relevance is lost. A **cross-encoder** reads query and passage **together** with full attention, which judges relevance much better. It fixes "right chunk was retrieved but ranked 14th", reducing noise and "lost in the middle" effects.

```python
from sentence_transformers import CrossEncoder
reranker = CrossEncoder("BAAI/bge-reranker-base")

def rerank(query, candidates, top=5):
    scores = reranker.predict([(query, c.text) for c in candidates])
    ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
    return [c for c, _ in ranked[:top]]
```

**Tuning**

- Candidate depth (50 to 100) vs latency: cost grows linearly with candidates; use GPU or a hosted rerank API, batch, and cap passage length.
- Measure **recall@k and nDCG before and after**, and answer quality end to end.
- Apply a **score threshold** to drop weak passages (and allow "no answer").
- Fine-tune on your domain pairs if general models underperform.

**Trade-offs:** adds 100 to 500 ms or more, extra infrastructure and cost; limited by first-stage recall (a reranker cannot rank what was not retrieved). Often one of the highest-impact upgrades for RAG quality.
