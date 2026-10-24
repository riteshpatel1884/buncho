**Principle:** combine **deterministic transformation tools** (codemods, AST rewriters such as OpenRewrite/jscodeshift) for the mechanical majority with **LLM agents** for the long tail, all gated by **automated verification**.

**Architecture**

```text
Repo(s) -> Analysis (dependency graph, build system, API usage inventory, test coverage)
   -> Migration plan (ordered units: leaf modules first; risk and size estimates)
   -> For each unit (parallel workers in sandboxes):
        1. Deterministic codemods (rules)
        2. LLM agent fixes remaining compile errors/deprecated APIs (with docs retrieval + examples)
        3. Build + unit/integration tests + static analysis + type check
        4. Fix-loop with bounded retries -> PR with diff, explanation, risk notes
   -> Human review (prioritised by risk) -> merge in small batches -> canary/rollout -> metrics
```

**Design decisions**

- **Verification is the product:** a migration is only as good as the tests. If coverage is low, first **generate characterization tests** that lock in current behaviour, then compare behaviour before and after (golden outputs, shadow traffic, differential testing).
- **Small, independent units** (per module/file group) so failures are isolated and reviewable; keep the codebase **buildable at every step**.
- **Leverage structure:** use the compiler/type checker errors as the agent's feedback loop; AST-aware edits instead of free text rewriting.
- **Knowledge injection:** retrieve migration guides, API mapping tables and previously accepted fixes (the system learns patterns and converts frequent ones into new deterministic rules).
- **Safety:** sandboxed builds, no production credentials, limited permissions, review before merge, easy rollback (feature flags, strangler pattern for big rewrites).
- **Cost control:** use rules first; LLM only on residual failures; cache; tiered models.

**Failure modes:** semantic changes that compile but behave differently (integer division, encoding, concurrency, date/time, serialization), hidden dynamic usage (reflection), generated code that "fixes" tests by weakening them (forbid editing test expectations without review).

**Metrics:** % of files migrated automatically, test pass rate, escaped defects after rollout, review time per PR, cost per KLOC, rollback rate.
