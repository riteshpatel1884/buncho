**Approach**

1. **Keep source metadata** on every chunk: document title, URL/id, page, section, last-updated date.
2. **Number the passages** in the prompt and ask the model to cite them inline:

```text
Context:
[1] (Leave Policy v3, p.4) Employees may carry over up to 5 days...
[2] (HR FAQ) Carry-over requests close on 31 January...

Answer using only the context. After every claim add the supporting passage number(s) like [1].
If the context does not contain the answer, say so.
```

3. **Structured output:** `{"answer": "...", "citations": [{"claim": "...", "source_id": 1, "quote": "..."}]}`, validated with a schema. Many providers have a native citations or grounding feature that returns spans.
4. **Verify automatically**
   - The cited id exists in the retrieved set.
   - The quoted text appears in that chunk (string or fuzzy match).
   - An NLI model or LLM judge confirms the passage **entails** the claim.
   - Drop or flag unsupported claims, or regenerate.
5. **Render** citations as links to the exact page or section (and highlight the quote), showing the source date.

```python
def validate(answer, chunks):
    ok = []
    for c in answer["citations"]:
        chunk = chunks.get(c["source_id"])
        ok.append(bool(chunk) and c["quote"].lower() in chunk.text.lower())
    return all(ok)
```

**Pitfalls:** fabricated citations (model invents ids), citing a passage that is only topically related (check entailment), citation granularity too coarse, and chunks lacking provenance. Measure **citation precision** (cited sources support the claim) and **citation recall** (claims that have a citation).
