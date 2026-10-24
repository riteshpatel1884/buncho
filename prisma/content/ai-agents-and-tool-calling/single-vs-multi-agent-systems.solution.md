**Single agent:** one LLM loop with all tools and one shared context. Simple, coherent, easy to debug.

**Multi-agent:** several LLM-driven agents, each with its **own role, prompt, tools and context**, cooperating on one goal.

**Common patterns**

| Pattern | How it works | Example |
|---|---|---|
| **Orchestrator-worker (supervisor)** | A lead agent splits the task and delegates to workers, then merges results | Research lead + parallel searchers |
| **Pipeline / sequential** | Output of one agent feeds the next | Writer -> reviewer -> editor |
| **Router / handoff** | A triage agent hands the conversation to a specialist | Support -> billing agent |
| **Debate / critic** | Agents propose and challenge | Reviewer checks coder's work |
| **Swarm / peer** | Agents coordinate through shared state | Simulations, brainstorming |

**Benefits of multi-agent**

- **Specialisation:** focused prompts and smaller tool sets per role.
- **Context isolation:** each agent keeps a small, relevant context.
- **Parallelism:** independent subtasks run concurrently.
- **Modularity:** swap or test agents separately; different models per role.

**Costs**

- More tokens, latency and money (agents re-read shared information).
- **Coordination errors:** lost information in hand-offs, conflicting assumptions, duplicated work.
- Harder debugging and evaluation (more traces, emergent behaviour).
- More attack surface (messages between agents can carry injection).

```python
def supervisor(task):
    subtasks = lead_llm.plan(task)
    results = parallel([worker(s) for s in subtasks])      # separate contexts
    return lead_llm.synthesise(task, results)
```

**Rule of thumb:** start with a single agent plus good tools; move to multi-agent only when context size, parallel breadth or role separation clearly demand it.
