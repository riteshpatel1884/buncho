**Problem with vector RAG:** it retrieves a few similar chunks. It struggles with questions that require **connecting entities across documents** or **summarising the whole corpus** ("What are the main themes across all incident reports?").

**GraphRAG (Microsoft Research, 2024) indexing**

1. **Extract entities and relationships** from every chunk with an LLM (people, products, orgs, events, and how they relate).
2. Build a **knowledge graph** from them (merge duplicate entities).
3. **Detect communities** (hierarchical clustering such as Leiden) of related entities.
4. **Pre-generate summaries** for each community at each level.

**Query modes**

- **Local search:** find entities mentioned in the question, then pull their neighbours, relations and related text chunks. Good for specific multi-hop questions.
- **Global search:** map-reduce over community summaries to answer broad, thematic questions about the entire dataset.

```text
"Who supplies the part that failed in project X?"  -> local: entity(Project X) -> part -> supplier
"What are the biggest risks across all projects?"   -> global: summaries of risk communities -> synthesis
```

**Use GraphRAG when**

- Data is entity-rich and relational (investigations, supply chains, research literature, enterprise knowledge).
- Users ask relationship, multi-hop or "big picture" questions.
- Explainability of connections matters.

**Prefer vector/hybrid RAG when** questions are mostly single-fact lookups, the corpus changes constantly, or budget is limited.

**Costs:** many LLM calls at indexing, graph maintenance and re-extraction on updates, entity-resolution errors, extra infrastructure (graph store). Lighter variants (LightRAG, graph-augmented retrieval over an existing vector index) trade some capability for cost. Evaluate against hybrid search plus reranking on your real queries before committing.
