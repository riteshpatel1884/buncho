**Two levels of evaluation**

1. **Public benchmarks (shortlisting):** **MTEB** (Massive Text Embedding Benchmark) scores models on retrieval, classification, clustering, reranking, STS and more; **BEIR** covers zero-shot retrieval; multilingual variants exist. Use the **retrieval** subset for RAG. These are a *screening* tool: models can overfit to them and your domain differs.
2. **Your own task evaluation (the decider):**

   - Build a **gold set**: 100 to 300 real queries (from logs, or generated and reviewed) each labelled with the relevant chunk/document ids.
   - Keep **everything else fixed** (chunking, index, metric, k) and swap only the model.
   - Compute **recall@k**, **MRR**, **nDCG@k** (and hit rate).

```python
def recall_at_k(model, gold, index, k=10):
    hit = 0
    for q, relevant in gold:
        ids = index.search(model.encode(q), k)
        hit += bool(set(ids) & relevant)
    return hit / len(gold)
```

**Also measure**

- **Latency and throughput** (query embedding and bulk indexing), **cost**, **index size** (dimensions), **max input length**.
- **Robustness:** typos, short queries, multilingual queries, jargon, long documents.
- **Slice analysis:** per query type or per document source; averages hide failures.
- **End-to-end:** retrieval quality feeds answer quality, so check faithfulness and answer accuracy on the same set.

**Pitfalls:** tuning on the test set, tiny gold sets (noise), unrealistic synthetic queries, ignoring the **query/document prefix** conventions, comparing models at different chunk sizes.

**Make it repeatable:** rerun the eval automatically whenever the model, chunking or index changes.
