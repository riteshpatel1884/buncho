**Types of duplicates**

- **Exact:** identical text (copied files, repeated boilerplate).
- **Near-duplicate:** small edits, different formatting, quoted email threads, templates.
- **Versions:** v1 / v2 / final of the same document.
- **Semantic duplicates:** same content, different wording (translations, summaries).

**At ingestion (best place, also shrinks the index)**

1. **Exact:** hash normalised text (lowercase, collapse whitespace, strip boilerplate); keep one, record other sources as metadata.
2. **Near-duplicate:** **MinHash/LSH** or SimHash over shingles to find items above a Jaccard threshold (for example 0.85); keep the canonical (newest or most authoritative) version.
3. **Boilerplate removal:** strip headers, footers, signatures, quoted replies, cookie banners before chunking.
4. **Versions:** keep a `status`/`version` field and index only the current one (or mark old ones to filter out).

```python
from datasketch import MinHash, MinHashLSH
lsh = MinHashLSH(threshold=0.85, num_perm=128)
def is_dup(doc_id, text):
    m = MinHash(num_perm=128)
    for w in set(text.lower().split()):
        m.update(w.encode())
    if lsh.query(m):
        return True
    lsh.insert(doc_id, m)
    return False
```

**At query time**

- **Embedding similarity filter:** drop results whose vector similarity to an already selected chunk is above about 0.95.
- **MMR** to diversify; **group by document or canonical id** and keep the best chunk.
- Rerank, then cap chunks per source.

**Governance:** keep a mapping of duplicates to canonical documents so citations point to the authoritative source; monitor the duplicate rate and index size. Evaluate that deduplication does not remove legitimately different content (such as regional variants with small differences).
