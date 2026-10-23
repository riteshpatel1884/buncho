**Step 1: find out why they conflict**

| Cause | Example | Fix |
|---|---|---|
| **Versions** | 2021 policy vs 2024 policy | Index only current versions or rank by recency; metadata `status` |
| **Scope** | Global policy vs India addendum | Metadata filters by region, product, audience |
| **Authority** | Official policy vs a wiki page or old email | Source authority ranking / trust tiers |
| **Duplicates with drift** | Copies edited separately | Deduplicate, designate a canonical source |
| **Real contradiction** | Two current official documents disagree | Surface it and escalate to the content owner |

**Step 2: prevent at retrieval and ranking**

- Add metadata (version, effective date, region, authority level, owner) and **filter** by the user's context.
- **Boost authoritative and recent** sources in reranking (add features to the score) and drop superseded ones.
- Clean the corpus: retire stale documents, mark canonical sources.

**Step 3: handle at generation**

- Instruct the model: "If sources disagree, prefer the most recent official source; if you cannot tell which applies, state the conflict, cite both, and do not guess."
- Provide the metadata (date, authority, region) next to each passage in the prompt so the model can reason about it.
- Use a **conflict detection pass** (NLI or LLM) over retrieved chunks: flag contradictions before answering.

```python
def answer(q, chunks):
    ctx = "\n".join(f"[{i}] ({c.source}, {c.version}, effective {c.date}, {c.region}) {c.text}"
                    for i, c in enumerate(chunks, 1))
    return llm(f"{ctx}\n\nQuestion: {q}\nRules: prefer the newest official source applicable to the user's region. "
               "If sources genuinely conflict, say so and cite both.")
```

**Step 4: process**

- Log conflicts and send them to content owners (a feedback loop that fixes the source).
- Evaluate with test cases containing conflicting documents; show dates and citations in the UI so users can verify.
