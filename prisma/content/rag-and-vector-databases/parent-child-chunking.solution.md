**Problem:** chunk size is a trade-off. Small chunks give precise embeddings but too little context for the LLM; large chunks give context but blurry embeddings.

**Idea:** decouple the unit you **search** from the unit you **send to the LLM**.

1. Split documents into large **parent** chunks (for example a section of about 1,500 tokens).
2. Split each parent into small **child** chunks (for example about 200 tokens).
3. **Embed and index the children;** store a pointer `child -> parent_id`.
4. At query time, search children, then **return the parent** (or the child plus neighbouring children) to the prompt. De-duplicate parents when several children of the same parent match.

```python
# index
for parent in split(doc, size=1500):
    parents[parent.id] = parent.text
    for child in split(parent.text, size=200):
        index.add(embed(child), meta={"parent_id": parent.id}, text=child)

# query
hits = index.search(embed(q), k=12)
parent_ids = list(dict.fromkeys(h.meta["parent_id"] for h in hits))[:4]
context = [parents[p] for p in parent_ids]
```

**Variants:** **sentence-window retrieval** (retrieve a sentence, return +/- N sentences), **hierarchical / auto-merging retrieval** (merge sibling chunks into the parent when enough of them match), and returning the section heading chain.

**Benefits:** precise matching with rich context; fewer missed answers split across chunk boundaries; better answers on explanatory questions.

**Costs and pitfalls:** more storage and a lookup step; larger prompts (watch token budgets and "lost in the middle"); the parent may contain unrelated text; tune child and parent sizes using recall@k and answer quality.
