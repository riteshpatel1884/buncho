**Requirements:** latest-by-default answers, point-in-time ("as of") queries, auditability, safe rollout and rollback.

**1. Document-level versions**

- Stable `doc_id`, plus `version`, `effective_from`, `effective_to`, `status` (draft, current, superseded, withdrawn) stored as chunk metadata.
- Default queries filter `status = current`; "as of" queries filter `effective_from <= T < effective_to`.
- Never silently overwrite: keep superseded chunks (or move them to a cold index) with their dates.

```python
filter = {"status": "current"}                                   # default
filter = {"effective_from": {"$lte": t}, "effective_to": {"$gt": t}}   # as-of query
```

**2. Index-level versions (for safe deploys)**

- Build a **new index version** (or collection) in parallel for big changes: new chunking, embedding model or schema.
- Evaluate it on the regression set; **switch an alias** (`kb_current -> kb_v7`) atomically; keep the previous index for quick rollback.
- For small updates, apply upserts with a **batch id** (`ingest_run_id`) stored in metadata so a bad run can be deleted by `run_id`.

**3. Pipeline controls**

- Content hashes for change detection; idempotent ingestion; ingestion log (what changed, when, by whom).
- Staging environment with automatic tests: counts, schema checks, spot retrieval queries, evaluation metrics must not regress.
- Source of truth stays in the document system (Git, SharePoint, CMS); the index is rebuildable.

**4. Answer-time behaviour**

- Cite the **version and effective date** in every answer; if sources conflict across versions, prefer the newest and say so.
- Cache keys include the index version.

**5. Governance:** retention rules, audit logs of which versions were used for each answer, access control per version, and alerts when superseded content appears in answers.
