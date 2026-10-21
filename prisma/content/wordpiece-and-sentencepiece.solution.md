## Short answer

They sit at different levels. **WordPiece** is a subword algorithm (used by BERT). **SentencePiece** is a tokenizer *library* that implements BPE or Unigram directly on raw text, without relying on whitespace pre-splitting.

## WordPiece

- Starts from characters and merges pairs like BPE, but chooses the pair with the highest score:

$$\text{score}(a,b)=\frac{\text{count}(ab)}{\text{count}(a)\times\text{count}(b)}$$

  This favours pairs whose parts rarely appear apart, rather than just frequent pairs.
- Marks word-internal pieces with a prefix: `playing` becomes `play` + `##ing`.
- Encodes with greedy **longest-match-first** against the vocabulary.
- Needs pre-tokenisation on whitespace and punctuation.

## SentencePiece

- Treats the input as a raw character stream and represents spaces with the symbol `▁`, so text is **losslessly reversible**: `detokenize(tokenize(x)) == x`.
- No language-specific pre-tokenisation, which suits languages without spaces (Japanese, Chinese).
- Supports two algorithms: **BPE** and the **Unigram language model**.
- **Unigram:** start with a large candidate vocabulary and repeatedly remove the tokens whose removal reduces corpus likelihood the least. It can output several segmentations with probabilities, enabling *subword regularisation* (random segmentations as training augmentation).

## Comparison

| | WordPiece | SentencePiece (BPE or Unigram) |
|---|---|---|
| Kind | Algorithm | Library / framework |
| Needs whitespace pre-split | Yes | No |
| Selection rule | Likelihood-style score | Frequency (BPE) or likelihood pruning (Unigram) |
| Reversible without extra rules | Not exactly | Yes |
| Examples | BERT family | T5 (Unigram), Llama 2 (BPE) |

## When the difference matters

- **Multilingual or no-space languages:** SentencePiece avoids language-specific word splitting.
- **Exact round trips** (code, whitespace-sensitive text, detokenisation): SentencePiece's reversibility helps.
- **Reusing a pretrained model:** you must use the tokenizer it was trained with, whatever its algorithm.

## Interview follow-up

*"Is SentencePiece an alternative to BPE?"* Not exactly, because it can *run* BPE. The distinction is the input handling (raw text, `▁` for spaces), not the merge rule.
