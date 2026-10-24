**Two products on shared infrastructure**

1. **Completion/chat in the IDE** (latency-critical, sub-300 ms for inline suggestions).
2. **PR review** (asynchronous, quality over speed).

```text
IDE plugin -> Context builder (current file, cursor, open tabs, imports, symbols, repo index)
   -> Completion model (small/fast, fill-in-the-middle) -> filters (secrets, licence, syntax) -> suggestion
Git provider webhook -> PR pipeline:
   diff + context retrieval (callers, tests, docs, style guide) 
   -> static analysis/linters/SAST results -> LLM reviewer (per file/hunk + summary)
   -> dedupe, rank by severity/confidence -> post inline comments -> feedback capture
```

**Completion design**

- **Fill-in-the-middle** models, aggressive caching, streaming, request cancellation as the user types, speculative decoding; context from the repository (retrieval + recently edited files).
- Post-filters: syntax validity, blocked secrets/PII, **licence/duplicate-code detection**, vulnerable patterns.

**Review design**

- Give the model **more than the diff:** surrounding code, related files, tests, CI results, project conventions.
- Combine **deterministic tools** (linters, type checkers, tests, SAST) with LLM judgment; ask the LLM to explain **why** and propose a fix.
- **Precision over recall:** each comment has confidence and category; suppress low-value style nits; cap comments per PR; learn from accept/dismiss signals per repo.
- Multi-pass: summarise change, find issues per hunk, **verify** each finding (can it be reproduced or refuted?), then publish.

**Security and privacy:** code stays in the tenant boundary, no training on customer code without consent, secrets scanning, prompt-injection defence from code comments, audit logs.

**Evaluation:** acceptance rate of suggestions, edit distance after acceptance, bugs caught vs false positives on labelled PRs, reviewer time saved, latency p95.
