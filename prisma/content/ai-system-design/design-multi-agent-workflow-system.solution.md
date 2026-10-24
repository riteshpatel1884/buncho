**Requirements:** workflows that run for minutes to days, agents with different roles/tools/models, parallel and sequential steps, human approvals, retries and resumability, auditability, bounded cost.

**Architecture**

```text
Workflow definition (graph/DSL/code: nodes = agents/tools/human steps, edges = control flow)
   -> Orchestrator / durable execution engine (Temporal / LangGraph + checkpointer / queue-based)
        Planner/supervisor agent (decompose, assign, replan)
        Worker agents (research, code, data, writer, critic) -> Tool gateway (permissions, sandbox, rate limits)
   -> Shared state/blackboard (typed task state, artifacts, messages) + memory stores
   -> Event bus (agent messages, status), human-in-the-loop approvals
   -> Observability (traces per agent/tool/token), evaluation harness, cost/budget controller
```

**Key design choices**

- **Orchestration pattern:** supervisor (central control), pipeline (fixed stages), parallel fan-out/fan-in, hierarchical teams, or peer debate. Prefer the **simplest pattern** that works: explicit graphs are more predictable than free-form chatting agents.
- **State and communication:** pass **structured artifacts** (JSON schemas, files, task cards) rather than long chat transcripts; each agent sees only the context it needs (smaller context, lower cost, fewer injection paths).
- **Durability:** checkpoint after each step; resume from failure; idempotent tool calls; timeouts; dead-letter handling; versioned workflows.
- **Control and safety:** permission scopes per agent (least privilege), approval gates for irreversible actions, sandboxed execution, **budgets** (steps, tokens, wall-clock, dollars) enforced by the orchestrator, loop and duplicate-work detection.
- **Quality:** critic/verifier agents or deterministic checks (tests, schema validation), consensus/voting for high-stakes outputs; avoid correlated errors by using different prompts/models for checks.
- **Failure handling:** retries with backoff, fallback agents/models, partial results, human escalation.
- **Observability:** distributed tracing with a trace per workflow, agent-level metrics, replay of failed runs, prompt/version tracking, evaluation on workflow-level success.
- **Scalability:** queue workers, concurrency limits per tool and model, rate limit-aware scheduling.

**Trade-offs:** autonomy vs predictability, parallelism vs cost, shared context vs isolation. Measure **task success, cost per task, latency, intervention rate** against a single-agent baseline to justify the complexity.
