**Definition:** RAG gives an LLM **external knowledge at query time**. Instead of relying only on what is stored in its weights, the system retrieves relevant documents and puts them in the prompt, so the model answers from that evidence.

**Problems it solves**

- **Knowledge cutoff / stale facts:** update the index, not the model.
- **Private data:** the model never saw your wiki, tickets or contracts.
- **Hallucination:** answers are grounded in retrieved text and can cite sources.
- **Cost and speed of change:** far cheaper than retraining; new documents are usable in minutes.
- **Access control and auditability:** you decide which documents each user can retrieve, and you can show sources.

**Basic flow**

```text
question -> embed -> search index -> top-k chunks -> prompt(question + chunks) -> LLM -> answer + citations
```

```python
def rag(question, retriever, llm, k=5):
    chunks = retriever(question, k=k)
    context = "\n\n".join(f"[{i+1}] {c.text}" for i, c in enumerate(chunks))
    return llm(f"Answer using only the context. Cite sources like [1].\n\nContext:\n{context}\n\nQuestion: {question}")
```

**Limits**

- Quality is capped by retrieval: if the right chunk is not retrieved, the model cannot answer correctly.
- Adds latency and infrastructure (index, embeddings, ingestion).
- Does not teach new skills or style (that is fine-tuning), and the model can still ignore or misread context.
- Needs evaluation of retrieval and generation separately.
