**Data poisoning** = an attacker manipulates training (or fine-tuning, RAG, feedback) data to alter model behaviour.

**Types**

- **Availability:** add noise/mislabels to degrade accuracy.
- **Targeted:** make specific inputs misclassified.
- **Backdoor/trojan:** inject trigger + target label; model behaves normally until the trigger appears.
- **LLM-specific:** poisoned web pages scraped for pretraining, malicious fine-tuning data, preference-data manipulation, poisoned RAG documents, and memory/feedback loop poisoning. A small number of samples can matter (research shows a roughly constant number of documents can implant backdoors regardless of dataset size).

**Prevention**

- Trusted sources and provenance, signed datasets with hashes, access control and review for data pipelines.
- Deduplication, outlier and label-noise detection, spectral signatures / activation clustering, influence analysis.
- Limit untrusted user feedback; rate-limit and validate contributions; robust aggregation.
- Canary/holdout trusted test sets; adversarial and backdoor scans before release.

**Response plan (confirmed poisoning)**

1. **Contain:** stop training/deploys, pin or roll back to the last known-good model, add runtime filters/blocklist for known triggers, consider disabling affected features.
2. **Scope:** use data lineage to identify the source, time window, affected datasets and model versions.
3. **Detect poisoned samples:** compare to clean snapshots, clustering, trigger search, influence functions, loss/gradient outliers, and behaviour tests with candidate triggers.
4. **Remediate:** remove/relabel bad data and **retrain or fine-tune from a clean checkpoint** (pruning, fine-pruning, unlearning only as a stopgap).
5. **Verify:** backdoor and regression evals, red team the repaired model.
6. **Harden and disclose:** fix the pipeline gap, add monitoring, notify stakeholders/regulators as required, run a post-mortem.
