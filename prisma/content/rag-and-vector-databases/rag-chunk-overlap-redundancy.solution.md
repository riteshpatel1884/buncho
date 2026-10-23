**Why it happens:** overlapping neighbours contain much of the same text, so they have similar embeddings and both rank in the top k. 40% overlap here means most of every chunk is duplicated in a neighbour.

**Fixes**

1. **Reduce overlap:** 10 to 15% (50 to 75 tokens) is usually enough to protect sentences at boundaries; better, **split on sentence or paragraph boundaries** so overlap is rarely needed.
2. **Merge adjacent hits:** if chunks `i` and `i+1` of the same document are both retrieved, **combine them** and remove the overlapping text before building the prompt.
3. **Diversify results:** use **MMR (maximal marginal relevance)**, which penalises candidates similar to already selected ones.
4. **Deduplicate by overlap:** drop a chunk if more than about 50% of its text is already included.
5. **Parent-child / window retrieval:** retrieve one small chunk and expand to its neighbours once, instead of storing overlapping copies.
6. **Collapse by document or section:** limit to 1 to 2 chunks per section unless the question needs more.

```python
def mmr(query_vec, cand_vecs, k=5, lam=0.7):
    chosen = []
    while len(chosen) < k and len(chosen) < len(cand_vecs):
        best, best_score = None, -1e9
        for i, v in enumerate(cand_vecs):
            if i in chosen:
                continue
            rel = cos(query_vec, v)
            red = max((cos(v, cand_vecs[j]) for j in chosen), default=0)
            score = lam * rel - (1 - lam) * red
            if score > best_score:
                best, best_score = i, score
        chosen.append(best)
    return chosen
```

**Check:** measure the redundancy rate (share of context tokens that are duplicates), recall@k and answer quality after the change, since too little overlap can cut answers in half.
