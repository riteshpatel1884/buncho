```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def retrieve_and_rerank(query, retrieve, k_candidates=40, k_final=5, min_score=None):
    cands = retrieve(query, k_candidates)                  # [(doc_id, text), ...] from vector/BM25 search
    scores = reranker.predict([(query, text) for _, text in cands], batch_size=32)
    ranked = sorted(zip(cands, scores), key=lambda x: x[1], reverse=True)
    if min_score is not None:
        ranked = [r for r in ranked if r[1] >= min_score]
    return [(doc_id, text, float(s)) for (doc_id, text), s in ranked[:k_final]]
```

**Model-free fallback (keyword overlap + original rank):**

```python
import re, math
def lexical_rerank(query, cands, alpha=0.5):
    q = set(re.findall(r"\w+", query.lower()))
    out = []
    for rank, (doc_id, text) in enumerate(cands):
        t = set(re.findall(r"\w+", text.lower()))
        overlap = len(q & t) / (len(q) or 1)
        prior = 1 / math.log2(rank + 2)               # earlier retrieval rank counts
        out.append((doc_id, text, alpha * overlap + (1 - alpha) * prior))
    return sorted(out, key=lambda x: x[2], reverse=True)
```

**Why it works:** bi-encoders compress the query and document **separately**, so fine interactions are lost; a **cross-encoder** scores the pair jointly and is far more accurate but too slow for the whole corpus. So: cheap recall-oriented retrieval of 30 to 100 candidates, then precise reranking of those.

**Production notes:** cap candidates for latency (batch and use GPU), cache results for repeated queries, use a score threshold to drop irrelevant context, evaluate with nDCG/recall before and after, and consider hosted rerankers.
