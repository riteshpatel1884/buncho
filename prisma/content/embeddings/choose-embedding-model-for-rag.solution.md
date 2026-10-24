**Criteria**

| Criterion | Questions |
|---|---|
| **Retrieval quality on your data** | Does it find the right chunk for your real queries? |
| **Domain and language** | Legal, medical, code, multilingual? Does it handle your languages and jargon? |
| **Max input length** | Does it fit your chunk size without truncation? |
| **Dimension and storage** | 384, 768, 1024, 3072 dims: memory, index size, search speed (Matryoshka models allow shortening vectors) |
| **Latency and throughput** | Query-time embedding latency; bulk indexing speed |
| **Cost** | API price per token vs GPU hosting for open models |
| **Deployment and privacy** | Hosted API or self-hosted (data residency) |
| **Licence and stability** | Open licence? Will the vendor deprecate the model? |
| **Asymmetric search support** | Separate query and document prefixes or modes |

**Process**

1. Shortlist 3 to 5 models from the **MTEB** leaderboard (retrieval tasks) that match language and size constraints.
2. Build a **gold set** of 100 to 300 real queries with the chunks that answer them (from logs or manual labelling; synthetic queries as a supplement).
3. Evaluate **recall@k, MRR, nDCG** on your own corpus with identical chunking.

```python
def evaluate(model, queries, corpus_ids):
    scores = []
    for q in queries:
        hits = index_search(model.encode(q.text), k=10)
        scores.append(int(any(h in q.relevant_ids for h in hits)))
    return sum(scores) / len(scores)          # recall@10
```

4. Check latency, cost and index size; consider hybrid search or fine-tuning the best candidate if domain gaps remain.
5. Plan for **re-indexing**: changing models means re-embedding everything, and mixing two models in one index is invalid. Version the index.
