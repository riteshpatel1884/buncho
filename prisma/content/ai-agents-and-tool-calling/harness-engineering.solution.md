**Agent = model + harness.** The **harness** is everything around the model that turns it into a reliable agent: the code that runs the loop, builds the context, exposes tools, enforces permissions, checks results and recovers from failure. **Harness engineering** is designing and tuning that layer.

**Components**

| Part | What it does |
|---|---|
| **Agent loop** | Calls the model, executes tool calls, feeds back results, decides when to stop |
| **Tools and their descriptions** | The action space; designed for models (clear names, compact outputs, helpful errors) |
| **Context management** | What goes into each prompt: instructions, files, history, memory, compaction |
| **Permissions and sandboxing** | Which actions need approval; filesystem and network limits |
| **Verification and feedback** | Tests, linters, type checks, screenshots, LLM judges that tell the agent whether it succeeded |
| **State and memory** | Task lists, notes, progress files, checkpoints for long tasks |
| **Orchestration** | Subagents, hooks, retries, budgets, timeouts |
| **Observability** | Traces, logs, evals, replay |

**Why it matters**

- With the same model, a better harness can produce a large jump in task success (better tools, context and verification), while model upgrades alone cannot fix missing feedback or unsafe actions.
- Agent failures are mostly harness failures: lost context, unclear tools, no way to verify, no stop condition.

**Practical principles**

1. Give the agent **ways to check its own work** (run tests, read errors).
2. Keep context lean and relevant; offload to files and subagents.
3. Make tools **simple and unambiguous**, with errors that say what to do next.
4. Put hard safety rules in code, not only in the prompt.
5. Measure with an eval set of real tasks and iterate on the harness like a product.
