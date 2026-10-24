**Requirements:** works on real repos (large, unfamiliar), edits multiple files, runs commands/tests, asks for permission for risky actions, resumes long tasks, controls cost.

**Architecture (harness around the model)**

```text
User task -> Agent loop (LLM with tools) 
   Tools: read/search files (grep, glob, symbol search), edit/patch, run shell/tests, git,
          web/docs lookup, LSP diagnostics, subagents
   Context manager: repo map + instructions file (CLAUDE.md-style) + retrieved snippets + compaction
   Permission layer: allowlist, approvals for writes/network/destructive commands
   Sandbox: container/VM with resource limits, scoped credentials
   Checkpoints: git branch/worktree, undo, session log
```

**The loop:** plan, search the codebase, read relevant code, make **small diffs**, run tests/linters/type checks, read errors, fix, repeat; stop when checks pass or the budget is hit; produce a summary/PR.

**Key design decisions**

- **Codebase understanding:** combine **agentic search** (grep/glob/symbol navigation) with optional semantic index and a compact **repo map**; large files read in ranges.
- **Editing format:** structured patch/search-replace edits that fail loudly if the anchor text does not match; avoid rewriting whole files.
- **Verification-driven:** tests and linters are the feedback signal; run targeted tests first; write failing tests for bugs.
- **Context engineering:** subagents explore in separate contexts and return summaries; compact history; persist notes/plan files; keep tool outputs trimmed.
- **Safety:** sandbox, no secrets in the environment, command allowlists and approval prompts, network restrictions, prevention of destructive git/file operations, defence against prompt injection in repo files, issues and web pages.
- **Model routing:** cheaper model for search/simple edits, stronger for planning and hard debugging.
- **Reliability:** step/token budgets, loop detection, resumable sessions, deterministic checks before declaring done.

**Evaluation:** SWE-bench-style task suites on your repos, pass rate, number of steps, cost per task, regression/revert rate, human review acceptance.
