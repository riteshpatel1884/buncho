## Definition

Tokenization converts raw text into a sequence of **integer IDs** drawn from a fixed vocabulary (typically 32k to 256k entries). The model only ever sees these IDs, which are mapped to embedding vectors. Decoding converts IDs back to text.

## Why not words or characters?

| Granularity | Pros | Cons |
|---|---|---|
| **Word** | Short sequences, meaningful units | Huge vocabulary, **out-of-vocabulary** words, poor for rare words, typos, code, morphology |
| **Character / byte** | Tiny vocabulary, no unknowns | Very long sequences, so attention cost grows quadratically; model must learn spelling-to-meaning from scratch |
| **Subword** | Bounded vocabulary, no unknowns, common words are single tokens, rare words split into reusable pieces | Splits can be unintuitive; language-dependent efficiency |

Modern LLMs use **subword** tokenizers: BPE (GPT family, Llama 3), WordPiece (BERT), Unigram via SentencePiece (T5, Gemma-style models). Many use **byte-level** fallback so any string can be encoded.

Example (illustrative): "unbelievably" might become `un` + `believ` + `ably`; a common word like "the" is one token; a rare name might be 4 to 5 tokens.

## Pipeline

1. **Normalise** (Unicode normalisation, sometimes lowercasing).
2. **Pre-tokenise** (split on whitespace and punctuation using a regex).
3. **Apply the learned subword model** (merges or segmentation).
4. **Add special tokens**: BOS, EOS, role markers for chat templates.

## Practical consequences

- **Cost and limits are measured in tokens**, not words. English averages roughly 0.75 words per token; **non-English languages and code often need more tokens**, so they cost more and fit less context.
- **Spelling and character-level tasks** (count the letters in "strawberry", reversing strings) are hard because the model sees chunks, not letters.
- **Arithmetic** suffers when numbers are split inconsistently; some tokenizers split digits individually.
- **Whitespace and casing matter:** `" hello"` and `"hello"` can be different tokens.
- **Domain terms** can fragment into meaningless pieces; fixes include training a domain tokenizer or adding tokens and fine-tuning embeddings.
- **Glitch tokens:** tokens that were rare or absent in training can cause odd behaviour.
- A tokenizer is **part of the model**: you must use the exact tokenizer a model was trained with.
