| Strategy | How | Best for | Weakness |
|---|---|---|---|
| **RAG** | Chunk, embed, retrieve top-k passages per question | Q&A over big corpora | Misses answers that need the whole document |
| **Map-reduce summarisation** | Summarise chunks in parallel, then summarise the summaries | Whole-document summaries | Loses detail, cost grows with size |
| **Refine / rolling** | Process chunks sequentially, carrying a running summary | Narrative documents | Slow, errors accumulate |
| **Hierarchical** | Summarise sections, then chapters, with a tree index | Very long structured docs | Complexity |
| **Long-context model** | Send everything | Moderate size, cross-reference tasks | Cost, latency, "lost in the middle" |
| **Recursive / agentic** | Model inspects the document with tools or code and calls itself on pieces | Complex multi-hop tasks | Cost variance |

```python
def map_reduce_summary(chunks, llm):
    parts = [llm(f"Summarise, keep numbers and names:\n{c}") for c in chunks]
    return llm("Combine into one coherent summary:\n" + "\n".join(parts))
```

**Practical advice**

- Chunk on structure (headings, paragraphs) with overlap, and keep metadata (page, section) for citations.
- Count tokens before sending; reserve room for the answer.
- Put the key instructions and question at the start and end (models use the middle less reliably).
- Cache embeddings and summaries; evaluate on questions whose answers sit in different parts of the document.
