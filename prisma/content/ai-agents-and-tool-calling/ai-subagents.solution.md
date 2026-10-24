**Definition:** a **subagent** is a separate agent instance launched by a parent (main) agent to handle a **delegated subtask**. It has its **own context window, system prompt and tool set**, runs its own loop, and returns **a result (usually a short summary)** to the parent.

**Why use them**

- **Context isolation:** exploring 40 files or 100 search results happens in the subagent's context; the parent receives only the conclusion, so its context stays clean.
- **Parallelism:** independent subagents run concurrently (research several topics at once).
- **Specialisation:** different prompt, tools and permissions per role (a read-only reviewer, a test runner).
- **Cost control:** run cheaper models for narrow tasks.

```python
def research(question, parent_llm):
    topics = parent_llm.split(question)
    summaries = parallel([run_subagent(t, tools=["search", "fetch"], max_steps=8) for t in topics])
    return parent_llm.synthesise(question, summaries)       # parent sees summaries only

def run_subagent(task, tools, max_steps):
    # fresh messages list: the subagent knows only the task and its tools
    return agent_loop(system="You are a focused researcher. Return a concise, cited summary.",
                      goal=task, tools=tools, max_steps=max_steps)
```

**Design points**

- Give the subagent a **clear, self-contained brief** (goal, constraints, output format); it does not see the parent's history.
- Define the **return format** (findings, evidence, confidence, open questions).
- Limit tools, steps, and budget; avoid unbounded recursive spawning.

**Pitfalls:** lost context (parent assumed shared knowledge), summaries that hide important detail, duplicated work, conflicting edits, higher total token cost, and harder debugging. Use them for breadth-heavy or context-heavy side tasks, not for tightly coupled steps.
