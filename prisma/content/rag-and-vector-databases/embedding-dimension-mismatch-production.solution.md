**Why you cannot mix:** an index has a fixed dimension, so inserting or querying with a different size errors out. And even if you **pad or truncate** vectors to force a fit, the two models define **different geometries**; similarity between them is meaningless. Dimension mismatch is just the visible symptom of a deeper incompatibility.

**Migration options**

1. **Full re-embed into a new index (recommended):**
   - Create `index_v2` with `dim=1024` and the new metric settings.
   - Re-embed every chunk in batches (use stored text and content hashes; checkpoint progress; rate-limit).
   - Run **dual-write** so new or changed documents go to both indexes during migration.
   - Evaluate v2 on the gold set, canary a small share of traffic, then **switch an alias** from v1 to v2.
   - Keep v1 for rollback, then delete.

2. **Query both indexes during transition:** encode the query with each model, search each index, merge by rank (e.g. RRF). Useful for a long migration; double cost until finished.

3. **Same dimension via Matryoshka** (only when the new model supports truncation to 768): still requires a re-embed, because it is a different model.

4. **Learned adapter/mapping** between spaces: a research-style shortcut with quality loss; do not rely on it for production without validation.

**Guardrails**

```python
assert len(vec) == collection.dim, f"dim {len(vec)} != index {collection.dim}"
# store with each collection: model, model_version, dim, metric, normalised
```

- Keep the original text to avoid re-extracting documents.
- Estimate cost up front: total tokens x price (or GPU hours) and time.
- Never point the new query encoder at the old index.
