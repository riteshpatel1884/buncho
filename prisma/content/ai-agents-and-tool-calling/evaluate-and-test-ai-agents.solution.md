**Why it is hard:** multi-step, non-deterministic, tool-dependent, with side effects and many valid paths.

**Evaluate at several levels**

| Level | What to measure |
|---|---|
| **Outcome** | Task success (goal achieved, correct final state in the database), answer correctness |
| **Trajectory / process** | Right tools and arguments, unnecessary steps, loops, recovery from errors |
| **Components** | Tool-selection accuracy, argument extraction, retrieval quality, planner quality |
| **Efficiency** | Steps, tokens, cost, latency per task |
| **Safety and policy** | Unauthorised actions, data leaks, refusals, escalation correctness, injection resistance |
| **Reliability** | **pass^k** (succeeds on all k runs) vs pass@k (at least one); variance across runs |
| **User experience** | Satisfaction, resolution rate, escalation rate |

**Build the test set**

- 100+ realistic tasks (from logs), each with a **verifiable end state** (for example "refund of $59 recorded, email sent, no other changes").
- Include edge cases, ambiguous requests, tool failures, adversarial inputs and policy traps.

**Methods**

1. **Simulated environments** with mocked or sandboxed tools and **simulated users** (an LLM plays the customer) so runs are repeatable (as in tau-bench style evaluations).
2. **State-based checks** (compare the final database state) in preference to text matching.
3. **LLM-as-judge** for conversation quality and policy adherence, calibrated against human labels.
4. **Trajectory assertions:** must call `verify_identity` before `refund`; must never call `delete_*`.
5. **Run each task several times** and report success rate with confidence intervals.
6. **Regression suite in CI** for every prompt, tool or model change.

```python
results = [run_agent(task, env=fresh_sandbox()) for task in tasks for _ in range(5)]
success = mean(check_final_state(r.env, task.expected) for r, task in zip(results, repeat_tasks))
```

**After launch:** log traces, sample and review failures, track escalation and thumbs-down, run shadow/canary deployments, and add every production failure to the test set.
