**Most likely cause: mixed vector spaces.** Embeddings from two different models (or even two versions of one model) live in **different, incompatible spaces**. If queries are encoded by the new model but the index still holds old vectors (or the reverse), similarities are meaningless.

**Diagnose**

1. Check the model name/version recorded for the **query encoder** and for the **indexed documents**.
2. Compare score distributions before/after; a sudden shift in mean top-1 similarity is a signature.
3. Run the **gold query set** against old and new setups, then compare recall@k.
4. Rule out other changes: chunking, normalisation, prefixes, tokenizer, truncation length, metric.

**Immediate fix:** **roll back** the query encoder to the model that built the index (or switch the alias back to the old index).

**Safe upgrade (blue/green indexes)**

```text
1. Build index v2 in parallel: re-embed ALL documents with the new model
2. Evaluate v2 offline on the gold set (recall@k, MRR, nDCG) vs v1
3. Shadow traffic or A/B a small percentage of queries
4. Switch the alias to v2 (queries must use the v2 encoder)
5. Keep v1 for fast rollback, then retire it
```

- Store `model_name`, `model_version`, `dim` and `index_version` with every vector or collection and **reject mismatches** at query time.
- Pin the model version; do not use "latest" aliases for production embeddings.
- Re-embedding cost: tokens x price, or GPU hours; budget it and run in batches.

**Gradual drift (no model change):** the **data or query distribution shifts** (new products, jargon, languages). Monitor: top-k similarity distribution, "no good result" rate, click/feedback signals, and periodic gold-set evaluation. Remedies: refresh the index with new content, fine-tune or switch the model, add hybrid search.

**Lesson:** treat an embedding model as part of the **schema** of your vector store, so changing it is a migration.
