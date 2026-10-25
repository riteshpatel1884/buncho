| | **BLEU** | **ROUGE** | **BERTScore** |
|---|---|---|---|
| Idea | **Precision** of n-grams of the candidate found in the reference(s) | **Recall** of reference n-grams found in the candidate | Match tokens by **contextual embedding similarity** |
| Computation | Geometric mean of modified n-gram precisions (n=1 to 4) times a **brevity penalty** | ROUGE-N: n-gram recall (often F1); ROUGE-L: longest common subsequence | For each token, max cosine similarity to tokens in the other text; average to get precision, recall, F1 (optional IDF weighting) |
| Origin / use | Machine translation | Summarisation | Generation, paraphrase, captioning |
| Handles paraphrase | No | No | **Yes** (semantic) |
| Needs reference | Yes | Yes | Yes |

$$\mathrm{BLEU}=\mathrm{BP}\cdot\exp\Big(\sum_{n=1}^{4}\tfrac14\log p_n\Big),\quad \mathrm{BP}=\min\big(1,e^{1-r/c}\big)$$

```python
from collections import Counter
def ngrams(t, n): return Counter(tuple(t[i:i+n]) for i in range(len(t)-n+1))
def rouge_n(cand, ref, n=1):
    c, r = ngrams(cand.split(), n), ngrams(ref.split(), n)
    overlap = sum((c & r).values())
    rec = overlap / max(sum(r.values()), 1); prec = overlap / max(sum(c.values()), 1)
    return rec, prec, 2*rec*prec/(rec+prec) if rec+prec else 0.0
print(rouge_n("the cat sat on the mat", "a cat sat on a mat"))   # shares "cat sat on mat"
```

**Weaknesses**

- **Surface overlap:** "The film was great" vs "The movie was excellent" scores low on BLEU/ROUGE although equivalent; fluent but wrong text can score high.
- Poor correlation with human judgment for **open-ended generation** and modern LLMs; blind to **factuality**, coherence and safety; sensitive to reference choice and length.
- BERTScore depends on the embedding model, scores cluster in a narrow range (rescale with a baseline), and still misses factual errors.

**When to use**

- **BLEU:** machine-translation regression tracking (prefer sacreBLEU, chrF, COMET for quality).
- **ROUGE:** extractive/abstractive summarisation baselines with reference summaries.
- **BERTScore:** semantic similarity where wording varies (paraphrase, captions, QA answers).
- For LLM assistants, use them only as **cheap sanity or regression signals**, backed by LLM-judge, factual-consistency checks and human review.
