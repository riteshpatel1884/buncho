**Why single-pass RAG fails**

- The question needs **several facts from different documents**, and later searches depend on earlier answers (hop 1: which product was recalled; hop 2: who supplies it; hop 3: which suppliers are in the EU).
- One embedding of the whole question matches none of the pieces well, so top-k returns partial or unrelated chunks.
- Aggregation questions ("how many...", "compare all...") need information scattered across many chunks.

**Fixes**

| Technique | How |
|---|---|
| **Query decomposition** | LLM splits into sub-questions; retrieve for each; combine |
| **Iterative / agentic retrieval** | Retrieve, read, generate the next query using what was found (ReAct, Self-Ask, IRCoT) |
| **Query rewriting + multi-query** | Several formulations raise recall |
| **Graph-based retrieval (GraphRAG)** | Entities and relations connect facts across documents; traverse the graph |
| **Larger / smarter context assembly** | Retrieve more, rerank, group by document, merge neighbours |
| **Structured sources** | Use SQL or knowledge graph for joins and aggregation |
| **Verification** | Check that each sub-answer is supported before composing the final answer |

```python
def multi_hop(question, retriever, llm, max_hops=4):
    evidence, q = [], question
    for _ in range(max_hops):
        evidence += retriever(q, k=5)
        nxt = llm(f"Question: {question}\nEvidence so far: {evidence}\n"
                  "If the evidence answers the question reply DONE, else write the next search query.")
        if nxt.strip() == "DONE":
            break
        q = nxt
    return llm(f"Answer using only this evidence:\n{evidence}\n\nQuestion: {question}")
```

**Evaluate** with a multi-hop test set (HotpotQA-style; your own chain questions), measuring answer correctness and whether all required supporting documents were retrieved. Watch latency and cost: each hop adds LLM and retrieval calls, so cap the hops and route only complex queries to this path.
