## Short answer

Tokenisation converts raw text into a sequence of integer ids drawn from a fixed vocabulary of **subword units**. The model never sees characters or words directly, only these ids.

## Why subwords

| Unit | Vocabulary | Sequence length | Problem |
|---|---|---|---|
| Characters / bytes | Tiny | Very long | Expensive attention, weak meaning per token |
| Words | Huge | Short | Out-of-vocabulary words; inflections explode the vocabulary |
| **Subwords** | 32k to 256k typical | Moderate | Compromise: common words are one token, rare words split into pieces |

Illustration (real splits depend on the tokenizer): "tokenization" might become `token` + `ization`.

## How it is built

A tokenizer is trained separately from the model on a text sample, using BPE, WordPiece or Unigram. It includes **special tokens** such as beginning and end of sequence and chat-role markers. Byte-level BPE can encode any string, so there is no unknown token.

## Why you should care as an engineer

- **Cost and limits are in tokens.** Count with the model's own tokenizer, not word counts. English averages roughly 0.75 words per token, while code, numbers and many non-English languages need more tokens for the same content.
- **Characteristic failures:** counting letters, reversing strings, digit-level arithmetic, and sensitivity to whitespace and casing all come from the model seeing chunks rather than characters.
- **Domain terms** (drug names, product codes) may split into many pieces, hurting quality and cost.
- **Consistency:** the tokenizer at inference must match training, and prompts must follow the chat template exactly.

## Interview follow-up

*"Why not just use bytes?"* It works (byte-level models exist), but sequences become several times longer, so attention cost and latency rise sharply.
