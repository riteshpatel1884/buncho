**N-gram speculation (prompt lookup decoding)** is speculative decoding whose **draft tokens are copied from text that already exists** in the prompt or generated so far, found by simple string matching, so **no draft model** and no training are needed.

**Algorithm**

1. Take the last $n$ generated tokens (e.g. $n=2$ to $4$) as a key.
2. Search the context (prompt + output) for an earlier occurrence of that n-gram.
3. If found, propose the **following $k$ tokens** (e.g. 5 to 10) as the draft.
4. The target model verifies the draft in one forward pass (normal speculative verification); accepted tokens are kept, otherwise fall back to ordinary decoding.

```python
def propose(ctx, n=3, k=6):
    key = ctx[-n:]
    for i in range(len(ctx) - n - 1, -1, -1):          # most recent match first
        if ctx[i:i+n] == key: return ctx[i+n:i+n+k]
    return []
```

**Where it shines:** outputs that **copy from the input**: summarisation, document QA/RAG with quotations, code editing and refactoring (most lines unchanged), translation of repeated entities, multi-turn chat with repeated context, structured extraction, and repetitive logs. Speedups of **2 to 4x** are reported on such tasks.

**Limitations:** little or no gain on free-form creative generation (no matches; a wasted lookup costs almost nothing but the verification overhead for bad drafts can slightly hurt); at high batch sizes the extra verified tokens consume compute; greedy/low-temperature works best; lookup cost on very long contexts (use suffix automata/hashing).

**Variants:** suffix decoding, lookahead decoding (Jacobi iteration generating n-grams on the fly), REST (retrieval-based drafts from a datastore), SAM/suffix-automaton drafting.

**Use:** vLLM `speculative_config={"method": "ngram", "num_speculative_tokens": 5, "prompt_lookup_max": 4}`; combine with draft-model or EAGLE methods per workload.
