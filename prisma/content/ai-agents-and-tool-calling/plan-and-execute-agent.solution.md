**Idea:** separate **planning** from **execution**.

1. **Planner (LLM):** reads the goal and produces an explicit, ordered **plan** (a list of steps).
2. **Executor:** carries out each step, often with a ReAct-style sub-loop and tools. It can use a **smaller or cheaper model** since each step is narrow.
3. **Replanner / verifier:** after steps complete (or fail), updates the plan, skips finished steps, adds new ones, or finishes with a final answer.

```python
def plan_and_execute(goal, planner, executor, replanner):
    plan = planner(goal)                         # ["find revenue 2023", "find revenue 2024", "compute growth"]
    done = []
    while plan:
        step = plan.pop(0)
        result = executor(step, context=done)    # may call tools
        done.append((step, result))
        decision = replanner(goal, done, plan)   # {"action": "continue"|"revise"|"finish", ...}
        if decision["action"] == "finish":
            return decision["answer"]
        if decision["action"] == "revise":
            plan = decision["plan"]
    return summarise(done)
```

| | ReAct | Plan-and-Execute |
|---|---|---|
| Decision style | One step at a time, reactive | Plans ahead, then acts |
| LLM calls | Big model every step | Big model for planning, cheaper model per step |
| Long tasks | Can lose the thread | Plan keeps direction and gives progress visibility |
| Adaptability | High | Needs replanning when plans break |
| Failure mode | Wandering, loops | Brittle plans built on wrong assumptions |

**Use Plan-and-Execute** for long, multi-step tasks with fairly predictable structure (research reports, data pipelines, migrations), where cost control and transparency matter. **Use ReAct** for exploratory tasks where the next step depends heavily on what the last tool returned. Many systems combine them: plan, then ReAct within each step, with replanning.
