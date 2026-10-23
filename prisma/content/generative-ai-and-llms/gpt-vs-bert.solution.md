| | GPT | BERT |
|---|---|---|
| Architecture | **Decoder-only** Transformer | **Encoder-only** Transformer |
| Attention | **Causal** (left-to-right): each token sees only earlier tokens | **Bidirectional**: each token sees the whole sequence |
| Pre-training | Next-token prediction (autoregressive) | Masked language modelling (+ next-sentence prediction in the original) |
| Output | Generates text token by token | Produces contextual embeddings for each token |
| Strength | Generation, chat, code, reasoning, few-shot prompting | Understanding: classification, NER, semantic search, extractive QA |
| Usage | Prompt it; optionally fine-tune | Add a small head and fine-tune |

**Intuition**

- BERT answers "what does this sentence mean?" because it reads both directions to build rich representations, but it cannot naturally generate long text.
- GPT answers "what comes next?", so it can generate and, at scale, follow instructions in context.

```python
from transformers import pipeline
pipeline("fill-mask", model="bert-base-uncased")("Paris is the [MASK] of France.")
pipeline("text-generation", model="gpt2")("Paris is the", max_new_tokens=10)
```

**Why decoder-only won for LLMs:** one simple objective scales to huge unlabelled data, one model handles many tasks via prompting, and generation is native. Encoder models are still very efficient for embeddings, rerankers and classifiers.
