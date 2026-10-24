**Definition:** the discipline of deciding **what information goes into the model's context window at each step**, and in what form, so the model has what it needs and little else. Prompt engineering is about wording one instruction; context engineering covers the **whole assembled context**: system prompt, tool definitions, retrieved documents, memory, conversation history, tool outputs, examples and user input.

**Why it matters:** context is limited and costly, and more is not better. Irrelevant, stale or conflicting content reduces accuracy ("context rot", lost in the middle), increases cost and latency, and causes the model to follow outdated instructions.

**Core techniques (write, select, compress, isolate)**

| Technique | What it means | Examples |
|---|---|---|
| **Write** (persist outside the window) | Save information to external storage for later | Scratchpads, notes/todo files, long-term memory |
| **Select** (retrieve the right pieces) | Pull only what is relevant now | RAG, tool retrieval, memory lookup, just-in-time file reads |
| **Compress** | Reduce tokens while keeping the signal | Summarise or compact history, truncate tool output, clear old tool results |
| **Isolate** | Split context across separate windows | Subagents, separate threads, sandboxed tool state |

**Practical guidelines**

- Keep the **system prompt** clear and minimal; put stable content first (enables caching).
- Give tools **concise outputs** and pagination.
- Load information **just in time** (file paths, queries) instead of up front.
- Order content deliberately; place critical instructions at the start and end.
- Remove or summarise what is no longer needed; track context size.
- Evaluate with and without each component to prove it helps.

```python
def build_context(task, state):
    return [system_prompt,
            *relevant_memory(task, k=3),
            state.summary,                    # compacted history
            *state.recent_messages[-6:],
            *retrieve(task, k=4),
            task]
```
