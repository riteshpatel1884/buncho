**LLMs are stateless;** "memory" is what the harness chooses to put back into the context.

| Type | What it holds | Implementation |
|---|---|---|
| **Short-term / working memory** | The current task: recent messages, tool results, scratchpad | The context window; trimmed, summarised or compacted as it grows |
| **Long-term memory** | Durable facts and preferences across sessions | Database or files; retrieved by key, query or vector search |
| **Semantic memory** | Facts and knowledge ("user prefers metric units", "company policy") | Key-value store, knowledge graph, vector store |
| **Episodic memory** | Specific past experiences (what was tried, what happened) | Logs of past runs/conversations; retrieve similar episodes |
| **Procedural memory** | How to do things: instructions, workflows, learned rules | System prompt, skill files, project instruction files (updated by the agent) |

**Operations:** **write** (decide what is worth saving, extract facts, avoid noise), **retrieve** (semantic search, recency, importance scoring), **update/forget** (merge duplicates, resolve contradictions, expire stale items).

```python
def remember(fact, user_id):
    if not store.exists_similar(user_id, fact, threshold=0.9):
        store.add(user_id, fact, embedding=embed(fact), created=now())

def recall(query, user_id, k=5):
    return store.search(user_id, embed(query), k=k)

prompt = f"Known about the user:\n{recall(user_msg, uid)}\n\n{user_msg}"
```

**Risks and design issues:** storing wrong or sensitive information (privacy, consent, retention, deletion rights), stale or conflicting memories, retrieval noise filling the context, memory poisoning through injected content, and per-user isolation. Keep memory **inspectable and editable**, scoped per user, and evaluate whether memory improves task success.
