| | Encoder-only | Decoder-only | Encoder-decoder |
|---|---|---|---|
| Attention | Bidirectional self-attention | Causal (masked) self-attention | Encoder: bidirectional. Decoder: causal + **cross-attention** to encoder output |
| Objective | Masked language modelling | Next-token prediction | Seq2seq / span corruption |
| Examples | BERT, RoBERTa | GPT, Llama, Claude, Mistral | T5, BART, original Transformer, Whisper |
| Output | Contextual embeddings | Generated text | Generated text conditioned on an input |
| Best for | Classification, NER, embeddings, reranking | Open-ended generation, chat, code, in-context learning | Translation, summarisation, speech-to-text |

**Why decoder-only dominates LLMs**

- One simple objective scales to trillions of unlabelled tokens.
- Every task becomes "continue the text", so prompting replaces task-specific heads.
- A single stack is simpler to scale, serve and cache (KV cache) than two stacks.

**When not to use it:** encoder models are smaller and cheaper for embeddings and classification; encoder-decoder suits tasks with a clearly separate input and output.
