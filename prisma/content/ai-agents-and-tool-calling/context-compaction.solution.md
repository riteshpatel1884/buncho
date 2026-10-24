**Problem:** long agent sessions accumulate messages and tool outputs until the context window is nearly full, costing money, slowing responses and degrading quality.

**Compaction:** when the context gets large, **replace older content with a shorter representation** and continue.

**Trigger:** token count crosses a threshold (for example 70 to 85% of the window), at a task boundary, or on request.

**What to preserve**

- The user's goal, constraints and instructions.
- Key decisions and their reasons; the current plan and progress.
- Important facts, file names, identifiers, error states, open problems, next steps.
- The most recent turns verbatim.

**What to drop or shrink:** verbose tool outputs (logs, full file dumps), repeated messages, dead ends (keep a one-line note), redundant explanations.

**Methods**

1. **LLM summarisation** of older messages into a structured summary.
2. **Tool-result clearing:** replace old tool outputs with short placeholders ("ran tests: 3 failed, see summary").
3. **Sliding window** plus summary of what scrolled out.
4. **Offload to files or memory** and keep pointers.
5. **Fresh context with handoff note:** start a new window seeded with the summary.

```python
def maybe_compact(messages, limit=0.8):
    if tokens(messages) < limit * CONTEXT_WINDOW:
        return messages
    old, recent = messages[:-8], messages[-8:]
    summary = llm("Summarise for continuing the task. Keep: goal, decisions, files touched, "
                  "errors, open items, next steps. Be specific.\n\n" + render(old))
    return [{"role": "user", "content": f"Summary of earlier work:\n{summary}"}, *recent]
```

**Risks:** the summary omits a needed detail (silent information loss), accumulates errors across repeated compactions, loses exact wording or numbers. Mitigate with structured summaries, keeping critical facts in files or memory, testing that tasks still succeed after compaction, and saving the full transcript for retrieval.
