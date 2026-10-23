**Why chunk:** embeddings represent a whole text with one vector, so long passages blur many topics; retrieval needs units small enough to match one idea, and prompts have limited space.

**Trade-off**

| Smaller chunks (100 to 300 tokens) | Larger chunks (500 to 1,000+ tokens) |
|---|---|
| Precise matching, less noise | More context per hit, fewer pieces to manage |
| Lose surrounding context; ambiguous pronouns | Diluted embeddings, more irrelevant text in the prompt |
| More chunks, bigger index | Higher token cost per query |

**Strategies:** fixed-size, recursive (by separators), sentence or paragraph, semantic, structure-aware (headings, sections, code functions), parent-child, and LLM-based or "contextualised" chunks.

**Choosing size, empirically**

1. Start with a sensible default: 300 to 500 tokens, 10 to 15% overlap, split on paragraphs/headings.
2. Consider the **content type** (FAQ answers: small; legal and technical docs: sections) and the **question type** (fact lookup: small; explanation or synthesis: larger).
3. Check the **embedding model's** best input length and max tokens.
4. Build a labelled query set and compare sizes by **recall@k**, MRR and final answer quality.

```python
for size, overlap in [(200, 30), (400, 60), (800, 100)]:
    index = build_index(chunk(docs, size, overlap))
    print(size, recall_at_k(index, eval_queries, k=5))
```

5. Attach metadata (title, section path, page, source) to every chunk, and keep headings in the text.

**Rule:** no universal best size; measure on your data.
