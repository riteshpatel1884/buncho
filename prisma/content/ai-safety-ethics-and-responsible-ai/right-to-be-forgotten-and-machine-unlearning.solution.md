**Legal context:** GDPR Art. 17 requires erasure **without undue delay** (usually within one month) when grounds apply, with exceptions (legal obligations, public interest, legal claims). Regulators have not settled whether a model trained on personal data itself "contains" personal data; the EDPB has said models that can output personal data are not automatically anonymous. Treat it as a risk to manage.

**Step 1: Erase everywhere you control**

- Primary DBs, data lake, backups (expiry schedule), logs, **vector stores and caches**, fine-tuning datasets, evaluation sets, analytics, vendor copies (propagate deletion via DPAs).
- Keep an **index of where each user's data lives** (data lineage), plus a suppression list so it is not re-ingested.

**Step 2: Address the model**

| Approach | Notes |
|---|---|
| **Do nothing + justify** | If data is demonstrably not memorised/extractable (tested with extraction and membership-inference attacks) and model is not personal data; document the assessment |
| **Retrain from scratch without the data** | Gold standard, expensive; batch deletions into scheduled retrains |
| **SISA / sharded training** | Train on shards/slices (Sharded, Isolated, Sliced, Aggregated); retrain only affected shard |
| **Approximate unlearning** | Gradient ascent/influence-based updates, fine-tune with negative examples, or adapters you can drop (user-specific LoRA); empirical, verify with attacks |
| **Output suppression** | Filters preventing generation of that person's data (a mitigation, not erasure) |
| **Prevention** | Data minimisation, exclude PII before training, **differential privacy**, per-tenant adapters, RAG instead of training on personal data |

**Step 3: Verify:** membership-inference and extraction tests before/after, utility regression checks.

**Step 4: Respond:** confirm to the user what was deleted, what remains and why (backups with retention, legal holds), timelines, and keep a deletion record (without the data).

**Design lesson:** keep personal data out of model weights; use retrieval and short retention so requests become simple database deletions.
