**Single-pass RAG:** fixed pipeline: retrieve once, generate once. It cannot decide to search again, pick another source or check its work.

**Agentic RAG:** an LLM **agent controls retrieval** as a loop of reasoning and tool calls (ReAct-style). It can:

- **Decide whether to retrieve** at all (small talk vs knowledge questions).
- **Plan and decompose:** split a multi-part question into sub-queries.
- **Choose tools and sources:** vector search, keyword search, SQL, web, APIs, a graph.
- **Rewrite queries** and retry when results are poor.
- **Grade retrieved context** for relevance and discard or re-search.
- **Verify** the draft answer against evidence before responding.

```python
def agentic_rag(question, tools, llm, max_steps=5):
    notes = []
    for _ in range(max_steps):
        step = llm.decide(question, notes, tools)        # {action: search|sql|answer, input: ...}
        if step.action == "answer":
            return llm.answer(question, notes)
        result = tools[step.action](step.input)
        notes.append(llm.summarise_relevance(question, result))   # keep only useful evidence
    return llm.answer(question, notes)
```

**Benefits:** better on multi-hop, ambiguous and multi-source questions; self-correcting.

**Costs and risks:** more LLM calls (latency and cost), variable behaviour, loops, harder testing, prompt injection through retrieved text, tool-misuse risks.

**Guidance:** start with a good single-pass pipeline; add agentic behaviour only for query types that measurably fail, with step limits, tracing and evaluation of whole trajectories.
