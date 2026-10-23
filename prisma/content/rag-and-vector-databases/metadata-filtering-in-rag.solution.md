**Role:** combine **semantic similarity** with **hard constraints**. Many relevance rules are not about meaning: the right country, product version, date range, document type or permission level.

**Useful metadata**

- Source, document id, title, section path, page.
- Document type, department, language, product, **version**, region.
- Dates: created, updated, effective-from/to.
- **Access control:** owner, groups, sensitivity label.
- Status: current vs superseded; tags.

**Benefits**

- **Precision:** a user from India asking about leave policy should not receive US or UK policies.
- **Freshness and correctness:** exclude superseded or expired versions.
- **Security:** enforce permissions inside the query.
- **Speed:** a smaller candidate set means faster search.

**How to apply**

1. **Pre-filtering (preferred):** the filter is part of the vector query so only allowed chunks are scored.
2. **Post-filtering:** retrieve top-k then drop; risks returning too few results.
3. **Query-derived filters:** use an LLM or rules to extract filters from the question ("2023 filings" becomes `year = 2023`), plus filters from user context (country, role).

```python
hits = index.query(
    vector=embed(question),
    top_k=10,
    filter={"country": {"$in": [user.country, "global"]},
            "status": "current",
            "allowed_groups": {"$in": user.groups}},
)
```

**Pitfalls:** inconsistent or missing metadata (garbage in, nothing out); over-restrictive filters that return empty results (add fallback: relax filters, then say so); high-cardinality filters hurting ANN recall or speed (check your vector DB's filtered-search support); LLM-extracted filters being wrong (validate against allowed values). Maintain a metadata schema and test it.
