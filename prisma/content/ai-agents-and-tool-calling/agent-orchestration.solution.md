**Definition:** the layer that **coordinates models, agents, tools and data** to complete a workflow: deciding the order of steps, routing work, passing context and state, handling errors, enforcing limits and collecting results.

**Responsibilities**

- **Routing:** pick the right agent, model or tool for each step.
- **Sequencing and parallelism:** dependency order; run independent steps concurrently.
- **State and context passing** between steps.
- **Control flow:** conditionals, loops, retries, fallbacks, human approval.
- **Resource governance:** budgets, timeouts, rate limits, model selection.
- **Observability:** traces, logs, evaluations.

**Implementation patterns**

| Style | Description | Pros / cons |
|---|---|---|
| **Code-driven workflow** | Developer defines steps in code or a DAG (prompt chains, Airflow/Temporal-style) | Predictable, testable; rigid |
| **LLM-driven orchestrator** | A lead model decides which agent or tool to call next (supervisor, router) | Flexible; less predictable, costlier |
| **Graph/state machine** | Nodes and conditional edges with shared state (LangGraph) | Clear control + flexibility, checkpointing |
| **Event-driven** | Agents react to events on a bus | Scalable, asynchronous; harder to reason about |
| **Learned orchestrator** | A trained model coordinates a pool of models | Adaptive; needs training (see Sakana Fugu) |

```python
def orchestrate(task):
    route = router_llm.classify(task)                       # LLM decides the branch
    if route == "research":
        parts = parallel([search_agent(q) for q in plan(task)])   # code decides parallelism
        return writer_agent(task, parts)
    if route == "data":
        return analyst_agent(task)
    return general_agent(task)
```

**Guidance:** put deterministic logic in code, use the LLM only for decisions that need judgement, keep each agent's responsibility narrow, define typed hand-offs, add timeouts/retries/budgets, and trace every step. Choose the least autonomous orchestration that meets requirements.
