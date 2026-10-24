**Causes**

1. **Goal erosion in context:** original instructions are far back, summarised away or truncated during compaction; recent messages dominate.
2. **Compounding errors:** a small wrong assumption early shapes every later step; summaries lock it in.
3. **Weak feedback:** no tests or checks tied to the real objective, so "looks fine" passes.
4. **Self-reinforcement:** the agent trusts its earlier notes and outputs, and treats its own summary as ground truth.
5. **Scope creep:** vague goals let new "useful" subtasks appear (rewriting unrelated modules).
6. **Context rot:** very long contexts reduce attention to key details.

**Diagnose**

- Replay the trace; find the **first step** where behaviour diverged from the goal (state at checkpoints helps).
- Check what the context contained at that point: was the goal present? Did compaction drop constraints?
- Compare against the success criteria: what check would have caught it?

**Fixes**

| Area | Practice |
|---|---|
| **Persistent goal** | Keep the objective, constraints and acceptance criteria in a **pinned section / file** (e.g. `PLAN.md`) re-read each step or after compaction |
| **Structured progress** | Task list with status; the agent updates it; each step must map to an item |
| **Scoped permissions** | Limit which files or modules may be edited; flag out-of-scope changes for approval |
| **Objective checks** | Run tests, linters, type checks, diff-size limits; stop if results regress |
| **Checkpoints and re-grounding** | Periodically restate the goal, compare current work to it, and ask "is this still on the plan?" |
| **Fresh contexts** | Split long work into shorter sessions or subagents with handoff notes instead of one endless context |
| **Independent reviewer** | A separate agent or human reviews diffs against the goal |
| **Drift metrics** | Track out-of-scope file edits, test pass rate, plan-item completion |

```python
def check_drift(diff_files, allowed_globs):
    outside = [f for f in diff_files if not any(fnmatch(f, g) for g in allowed_globs)]
    return outside          # non-empty -> pause and ask for approval
```

**Principle:** long autonomy requires external memory, measurable checks and human or independent oversight, not just a capable model.
