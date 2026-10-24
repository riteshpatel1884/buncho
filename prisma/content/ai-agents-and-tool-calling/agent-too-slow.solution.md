**Measure first:** trace each step (LLM time, tool time, queueing) and compute the **critical path**. Typical split: many sequential LLM calls (each seconds), slow tools, long prompts and outputs.

**Speed-ups**

| Lever | Action |
|---|---|
| **Fewer steps** | Better tools that do more per call; plan once; combine steps; stop when sufficient; reduce wandering with clearer instructions |
| **Parallelism** | Issue independent tool calls **in parallel** (many APIs support parallel tool use); fan out subagents for independent subtasks; async I/O |
| **Faster models** | Small/fast model for easy steps (routing, extraction), strong model for hard reasoning; lower reasoning effort when not needed |
| **Shorter prompts** | Smaller contexts cut time to first token: trim tool outputs, compact history, fewer tools in the prompt |
| **Prompt caching** | Cache the stable prefix to cut latency and cost |
| **Shorter outputs** | Concise responses, no needless explanation between tool calls |
| **Streaming** | Show progress and partial results so perceived latency drops |
| **Tool latency** | Cache results, use faster endpoints, precompute indices, set timeouts, avoid cold starts |
| **Speculative work** | Prefetch likely data while the model is thinking |
| **Retries** | Use sane timeouts and fail fast; avoid long backoff on user-facing paths |
| **Async / background** | For long tasks, return immediately and notify when done |

```python
async def gather_facts(queries):
    return await asyncio.gather(*[search(q) for q in queries])      # parallel instead of sequential
```

**Quality guardrail:** evaluate success rate and cost per task on a fixed set after each change; track p50/p95 latency and steps per task; set latency budgets per stage.

**UX:** show a visible plan and progress, allow users to interrupt or steer, and consider quick answers first, then deeper work in the background.
