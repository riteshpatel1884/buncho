**Problem:** user queries are short, ambiguous, conversational ("what about for contractors?") and phrased differently from the documents, so direct embedding search misses.

| Technique | What it does | Helps when |
|---|---|---|
| **Query rewriting** | LLM turns a follow-up into a standalone, specific query using chat history | Multi-turn chats, vague questions |
| **Multi-query** | Generate 3 to 5 paraphrases or perspectives; retrieve for each; merge (RRF) | Vocabulary mismatch, recall |
| **HyDE** (Hypothetical Document Embeddings) | LLM writes a **hypothetical answer**; embed *that* to search, since an answer looks more like a document than a question does | Short queries, zero-shot domains |
| **Decomposition** | Split a complex question into sub-questions, retrieve for each, combine | Multi-part and multi-hop questions |
| **Step-back prompting** | Ask a more general question first ("what are the principles of X?") and retrieve background along with the specific query | Specific questions needing general context |
| **Query routing / metadata extraction** | Choose index or filters from the query | Several sources, filters |

```python
def hyde_search(question, llm, embed, index, k=8):
    fake_answer = llm(f"Write a short passage that answers: {question}")
    return index.search(embed(fake_answer), k)

def multi_query(question, llm, search):
    variants = llm(f"Write 4 different search queries for: {question}").splitlines()
    return rrf([search(v) for v in [question] + variants])
```

**Costs and risks**

- Extra LLM call(s): +200 ms to seconds and tokens.
- **HyDE can hallucinate** details that mislead retrieval; works best with hybrid search and when the LLM knows the domain.
- Rewriting can drop important terms; keep the original query as one of the searches.
- Apply selectively (for example a classifier decides which queries need it) and measure recall@k before and after.
