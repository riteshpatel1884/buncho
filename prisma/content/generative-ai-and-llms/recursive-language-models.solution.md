**Idea (MIT, Zhang et al., 2025):** an *inference-time* strategy that treats a very long prompt as part of an **external environment** instead of feeding it all into the context window.

**Mechanism**

1. The full input is stored as a **variable inside a Python REPL**. The root LLM sees only metadata (for example its length), not the content.
2. The model **writes code** to inspect the data: slice it, regex-filter it, chunk it, count things.
3. It makes **recursive sub-calls** to an LLM on selected snippets, stores the results in variables, and composes them into the final answer (which can also exceed the normal output limit).

```python
# what the root model might write inside the REPL
hits = [c for c in chunks(prompt, 5000) if "invoice" in c.lower()]
parts = [llm_query(f"Extract the totals:\n{c}") for c in hits]
answer = llm_query("Combine these into one total:\n" + "\n".join(parts))
```

**Reported results:** handles inputs up to roughly two orders of magnitude beyond the base context window (10M+ tokens in tests), beats long-context baselines and summarisation/retrieval agents on several benchmarks, at comparable or lower median cost. On dense pairwise reasoning tasks where base models score near zero, RLMs reached substantial scores.

**Limitations**

- Cost has high variance; long trajectories can be expensive.
- Sub-calls run sequentially, so latency is high.
- Only shallow recursion was tested; for short prompts a plain model can be better.
- Current models are not trained for this, and make inefficient decisions about what to read.

**Compared with RAG:** RAG fixes what to retrieve up front with similarity search; an RLM decides programmatically and adaptively, which helps when the task needs aggregation across the whole input.
