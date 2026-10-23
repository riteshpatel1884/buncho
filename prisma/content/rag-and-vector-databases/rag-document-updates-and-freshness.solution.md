**Why answers go stale:** the index is a snapshot. Edited, deleted or superseded documents leave old chunks behind, new documents appear late, and old and new versions compete in retrieval.

**Design**

1. **Change detection:** webhooks or change feeds from sources; otherwise periodic crawls comparing **content hashes** and `last_modified`.
2. **Incremental indexing:** re-process only changed documents. Use stable ids `doc_id#chunk_no` and per-chunk content hashes so unchanged chunks are not re-embedded.
3. **Upsert and delete:** on update, delete all old chunks of that document, then insert the new ones (atomically if possible); handle **deletes** with tombstones so removed content disappears.
4. **Freshness SLA and queue:** a streaming queue with workers; track index lag (time from source change to searchable) as a metric.
5. **Reconciliation job:** periodically compare source-of-truth ids with indexed ids and repair drift.
6. **Metadata for recency:** store `updated_at`, `version`, `status` (current, superseded); **filter out** superseded versions or boost recent documents in ranking when appropriate.
7. **Cache invalidation:** purge cached answers and embeddings that depended on changed documents.
8. **Re-embed on model change:** build a new index in parallel and switch over.

```python
def sync(doc):
    h = sha256(doc.text)
    if state.get(doc.id) == h:
        return                                   # unchanged
    index.delete(filter={"doc_id": doc.id})      # remove old chunks
    chunks = chunk(doc.text)
    index.upsert([{"id": f"{doc.id}#{i}", "vector": embed(c), "text": c,
                   "doc_id": doc.id, "updated_at": doc.modified} for i, c in enumerate(chunks)])
    state[doc.id] = h
```

**Answer-time safeguards:** show source dates in citations, instruct the model to prefer the newest source and to flag date conflicts, and monitor complaints about outdated answers.
