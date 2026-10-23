**Definition:** RAG that does **not rely on embeddings or a vector database** to find context. Retrieval uses lexical search, document structure or LLM reasoning instead of nearest-neighbour search in vector space.

**Why people look at it**

- Similarity is not the same as relevance: embeddings can retrieve text that "sounds like" the query but does not answer it.
- Chunking destroys structure, tables and cross-references.
- Vector infrastructure adds cost, tuning and re-indexing.

**Main approaches**

1. **Lexical retrieval:** BM25 / full-text search (Elasticsearch, SQLite FTS, ripgrep). Fast, exact, explainable; weak on paraphrase.
2. **Structure- and reasoning-based retrieval:** build a **table-of-contents tree** (sections with summaries) and let an LLM **navigate it** (choose a branch, read the section, decide to go deeper) like a human with a long report (the approach behind tree-index systems such as PageIndex). No chunking or embeddings required.
3. **Agentic search over files and tools:** the model uses search, grep, file-open and SQL tools iteratively (as coding agents do) and reads whole sections.
4. **Knowledge graph or SQL lookups** for structured facts.

```python
def navigate(llm, node, question):
    if node.is_leaf:
        return node.text
    choice = llm(f"Question: {question}\nSections:\n" +
                 "\n".join(f"{i}. {c.title}: {c.summary}" for i, c in enumerate(node.children)) +
                 "\nWhich section most likely contains the answer? Reply with the number.")
    return navigate(llm, node.children[int(choice)], question)
```

**Good fit:** long, well-structured documents (financial filings, manuals, contracts), moderate corpus sizes, high precision needs, exact identifiers.

**Trade-offs:** more LLM calls and latency per query, harder to scale to millions of documents, depends on good structure and summaries. Often the best system is **hybrid**: lexical + vector + reasoning-based navigation, chosen by evaluation.
