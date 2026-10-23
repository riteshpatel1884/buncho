**Cause:** repeated text raises the probability of repeating again (a self-reinforcing loop). Greedy decoding and beam search, low temperature, long contexts and small or weakly trained models are most vulnerable.

**Fixes**

| Fix | How |
|---|---|
| **Sampling** | Use temperature 0.7 to 1.0 with top-p (0.9 to 0.95) or top-k instead of greedy |
| **Repetition penalty** | Down-weight logits of tokens already generated (`repetition_penalty` about 1.1 to 1.2) |
| **Frequency / presence penalties** | Penalise by count or any prior appearance |
| **No-repeat n-gram** | Forbid repeating any n-gram (`no_repeat_ngram_size=3`) |
| **Min-p / typical sampling** | More robust truncation |
| **Prompting** | "Do not repeat; each paragraph should add new information"; outline first |
| **Chunked generation** | Generate section by section with a short summary of previous sections |
| **Model-level** | Fine-tune with unlikelihood loss or better data; use a stronger model |

```python
out = model.generate(**inputs, max_new_tokens=600, do_sample=True,
                     temperature=0.8, top_p=0.92,
                     repetition_penalty=1.15, no_repeat_ngram_size=4)
```

**Trade-offs:** strong penalties break legitimately repeated text (code, names, rhymes). Tune on a sample, and detect loops automatically (n-gram overlap ratio) so you can retry with different settings.
