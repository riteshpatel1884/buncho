**Finding (Liu et al., 2023):** when relevant information is placed in the **middle** of a long context, models retrieve and use it **worse** than when it is at the **beginning or end**. Accuracy versus position forms a **U-shape**, even in models with long advertised windows.

**How it was measured:** multi-document QA where the answer-bearing document is moved to different positions among distractors; and key-value retrieval tasks. Accuracy dropped markedly for middle positions and decreased as the number of documents grew.

**Likely causes**

- Training data and positional behaviour favour the start (primacy; attention sinks) and the end (recency).
- Attention gets diluted across many tokens; distractors compete with the relevant passage.
- Long-context training is often less thorough than short-context training.

(Newer models are better, but the effect has not disappeared, so test your own model.)

**Mitigations**

- **Retrieve less, better:** rerank and pass only the top few chunks; fewer distractors.
- **Order deliberately:** put the most relevant chunks at the start and end (for example "long-context reorder": best, third best... then second best).
- **Repeat the question** (and key instructions) at the end of the prompt.
- **Chunk and map-reduce** instead of one giant prompt; summarise or extract first.
- **Ask for quotes** or evidence first, then answer from the quotes.
- Use structure (headings, ids) so the model can locate sections.
- **Evaluate** with "needle in a haystack" style tests at different depths and with real tasks.

```python
def long_context_reorder(chunks_by_relevance):    # input: best first
    best_first = chunks_by_relevance[0::2]            # ranks 1, 3, 5... go to the start
    best_last = chunks_by_relevance[1::2][::-1]       # ranks ..., 4, 2 go to the end
    return best_first + best_last                     # weakest chunks end up in the middle
```
