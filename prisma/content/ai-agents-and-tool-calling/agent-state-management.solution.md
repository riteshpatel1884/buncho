**State = everything needed to continue the task:** the goal and plan, messages, tool results, intermediate variables, progress markers, pending approvals, and metadata (budget used, step count).

**Design**

1. **Explicit, typed state object** (not hidden in prompts):

```python
class AgentState(TypedDict):
    goal: str
    plan: list[str]
    completed: list[dict]            # step, result
    messages: Annotated[list, add_messages]   # reducer: append
    pending_approval: dict | None
    budget_used_usd: float
```

2. **Persistence via checkpoints:** save state after every step (or node) to durable storage (Postgres, Redis, object store) keyed by `thread_id`/`run_id`, so a run can **resume** after a crash, deploy or pause. LangGraph provides checkpointers (memory, SQLite, Postgres) and `interrupt()` for human pauses.
3. **Reducers and merge rules** for concurrent updates (append messages, replace plan, merge dicts) to avoid lost updates when parallel branches write.
4. **Separate kinds of state:** *run state* (this task), *session/thread memory* (conversation), *long-term memory* (cross-session facts), *external state* (the world: databases, tickets); never assume external state is unchanged on resume (re-check preconditions).
5. **Idempotency:** each step records that it ran (step id, idempotency key) so replays do not repeat side effects.
6. **Versioning:** version the state schema and workflow; migrate or pin old runs.
7. **Observability:** store a **history of states** for debugging and time travel (replay from a checkpoint, fork with edits).
8. **Size control:** keep large artifacts (files, documents) in blob storage and store references; compact message history.

```python
graph = builder.compile(checkpointer=PostgresSaver(conn))
config = {"configurable": {"thread_id": "ticket-8841"}}
graph.invoke({"goal": "resolve refund"}, config)        # pauses at interrupt()
graph.invoke(Command(resume={"approved": True}), config)   # resumes from checkpoint, hours later
```

**Pitfalls:** state that only lives in the prompt, non-serialisable objects, concurrent runs on one thread, secrets in state, and unbounded growth.
