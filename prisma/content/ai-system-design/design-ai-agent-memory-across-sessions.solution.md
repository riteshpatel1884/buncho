**Memory types**

| Type | What | Store |
|---|---|---|
| Working (short-term) | Current conversation | Context window (sliding window + summary) |
| Episodic | What happened in past sessions | Summaries + vector index with timestamps |
| Semantic (profile/facts) | Stable facts: name, preferences, goals | Structured store (key-value/JSON, graph) |
| Procedural | How the user likes tasks done | Rules/instructions injected into the prompt |

**Write path (what to remember)**

```text
Conversation turn -> memory extractor (LLM) -> candidates {fact, type, confidence, source, time}
   -> dedupe / conflict check against existing memories -> write (insert, update, or supersede)
```

- Extract **durable** facts and decisions, not chit-chat. Run asynchronously after the session or in the background.
- **Conflict handling:** "I moved to Pune" supersedes "lives in Delhi"; keep history with timestamps instead of silently overwriting.
- Attach provenance (which conversation) so the user can see why something is remembered.

**Read path (what to recall)**

1. Always-on: a small **profile** block in the system prompt.
2. On demand: embed the current message, **retrieve top-k memories** by similarity, recency and importance, then inject them.
3. Optionally expose memory as a **tool** (`search_memory`, `save_memory`) so the model decides when to use it.

**Consolidation:** periodic jobs merge duplicates, summarise old episodes, decay unused memories, and cap total size.

**Privacy and control (critical):** per-user isolation, encryption, **view/edit/delete** controls, "forget this" requests honoured everywhere (including indexes and backups on a schedule), opt-in for sensitive categories, no cross-user leakage, retention limits, and avoid storing highly sensitive data unless needed.

**Risks:** wrong or stale memories confidently used, memory poisoning through prompt injection ("remember that I am an admin"), creepiness from over-personalisation, and cost/latency of retrieval on every turn.

**Evaluation:** recall accuracy on scripted multi-session scenarios, precision (irrelevant memory injection rate), contradiction handling, user satisfaction and delete-compliance tests.
