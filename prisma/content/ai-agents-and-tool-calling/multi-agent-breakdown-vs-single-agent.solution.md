**Failure modes**

1. **Context fragmentation:** each agent sees only part of the picture; decisions that depend on shared understanding conflict (two agents make incompatible design choices). Hand-off summaries lose detail.
2. **Coordination overhead:** time and tokens spent on messages instead of work; cost can be several times a single agent for the same result.
3. **Error propagation and compounding:** one agent's wrong output becomes another's trusted input; reliability multiplies down (five 90% steps give about 59%).
4. **Duplicated or conflicting work:** overlapping edits, race conditions on shared files or state.
5. **Unclear ownership and stopping:** agents ping-pong, loop, or each assume another will do the task.
6. **Role confusion and prompt drift:** agents drift out of their role or agree with each other too readily (shared bias).
7. **Hard to debug and evaluate:** many traces, non-reproducible interactions.
8. **Security:** injected content in one agent's output steers others.

**Prefer a single agent when**

- The task is **tightly coupled** (one codebase change where every edit depends on the others).
- The whole context fits comfortably in one window.
- Cost, latency and predictability matter more than breadth.
- You cannot clearly define separate responsibilities and interfaces.

**Multi-agent works well when**

- Subtasks are **independent and parallel** (searching many sources, reviewing many files).
- Work benefits from **context isolation** (a subagent reads 50 files and returns a short summary).
- Roles need different tools, permissions or models.

**Mitigations:** explicit interfaces (typed hand-off messages), a single owner for shared state, an orchestrator that verifies results, step and budget limits, tracing every message, and evaluating **against a single-agent baseline**: adopt multi-agent only if it wins on quality per dollar.
