**1. Collect failures:** log the full request (system prompt, history, retrieved passages, user message, model output) and label 50 to 100 bad cases. Group them by cause.

**2. Common causes and fixes**

| Cause | Symptom | Fix |
|---|---|---|
| Vague or conflicting system prompt | Generic or off-topic replies | Rewrite: role, scope, what to do when unsure, output format; add few-shot examples |
| Poor or no retrieval | Answers ignore company facts | Add RAG; improve chunking, embeddings, hybrid search, reranking |
| Wrong context retrieved | Fluent but unrelated | Evaluate retrieval separately (recall@k); tune top-k, add metadata filters |
| Conversation history pollution | Answers earlier topic | Summarise or truncate history; rewrite follow-up questions into standalone queries |
| Ambiguous user input | Guesses | Ask a clarifying question |
| Out-of-scope questions | Invents an answer | Add a refusal/handoff rule and a scope classifier |
| Model too weak or temperature too high | Rambling | Use a stronger model, lower temperature |
| Domain gap | Wrong terminology | Fine-tune or add domain glossary to context |

**3. Prove the fix**

```python
# regression suite: fixed questions + expected facts or a judge rubric
cases = [{"q": "How do I reset my password?", "must_include": ["settings", "reset link"]}]
for c in cases:
    ans = bot(c["q"])
    assert all(k in ans.lower() for k in c["must_include"]), c["q"]
```

**4. Keep it good:** monitor thumbs-down rate, log retrieval scores, review samples weekly, and re-run the eval set before every prompt or model change.
