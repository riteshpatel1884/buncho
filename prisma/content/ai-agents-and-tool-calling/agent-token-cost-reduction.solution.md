**Why agents are expensive:** each loop step **re-sends the whole context**, so cost grows roughly quadratically with the number of steps if the context keeps growing. Tool outputs (web pages, logs, files) usually dominate.

**Diagnose:** log per-step input and output tokens, split by component (system prompt, tool definitions, history, tool results, retrieved docs), and find the biggest contributors and steps per task.

**Savings levers**

| Lever | Action |
|---|---|
| **Shrink tool outputs** | Return only needed fields; truncate and paginate; summarise pages; use `grep`-like extraction instead of full-file reads |
| **Clear stale tool results** | Replace old outputs with one-line notes once used |
| **Compaction** | Summarise history when it grows (context-compaction) |
| **Prompt caching** | Keep system prompt and tool definitions as a stable prefix so repeated reads are cheap |
| **Fewer, better tools** | Smaller tool list (tool definitions are re-sent every step) |
| **Subagents** | Heavy exploration in isolated contexts; parent receives summaries |
| **Model routing** | Cheaper model for easy steps (classification, extraction), strong model for planning |
| **Reduce steps** | Better tool design, batch tool calls, plan first, parallelise independent calls |
| **Output control** | Concise responses, no unnecessary chain-of-thought for simple steps |
| **Caching results** | Memoise repeated tool calls and retrievals |
| **Early stopping** | Stop when the success criterion is met |

```python
def trim_tool_result(text, limit=2000):
    return text if len(text) <= limit else text[:limit] + f"\n...[truncated {len(text)-limit} chars; use read_range to see more]"
```

**Protect quality:** evaluate on a fixed task set (success rate and cost per task) after each change; set a per-task token budget and alert on outliers; compare cost per **successful** task, not just per run.
