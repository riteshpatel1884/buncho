| | Autoregressive (causal LM) | Masked LM |
|---|---|---|
| Task | Predict next token | Predict randomly masked tokens (about 15%) |
| Context | Left only | Both sides |
| Example input | `The cat sat on` -> `the` | `The cat [MASK] on the mat` -> `sat` |
| Architecture | Decoder with causal mask | Encoder with full attention |
| Models | GPT, Llama, Claude | BERT, RoBERTa |
| Signal per sequence | Every token is a target | Only masked positions (about 15%) |
| Generation | Natural, token by token | Not natural (needs iterative fill-in) |
| Strength | Generation, in-context learning, scales to general assistants | Rich bidirectional representations for classification, search, NER |

```python
from transformers import pipeline
pipeline("fill-mask", model="roberta-base")("Paris is the <mask> of France.")      # masked
pipeline("text-generation", model="gpt2")("Paris is the", max_new_tokens=8)       # autoregressive
```

**Mismatch to know:** MLM sees `[MASK]` tokens in pre-training but not at fine-tuning, and each sequence provides less learning signal; autoregressive training has no such mismatch.

**Related:** T5 uses span corruption (encoder-decoder); diffusion language models generalise masked prediction into a generative process by unmasking iteratively.
