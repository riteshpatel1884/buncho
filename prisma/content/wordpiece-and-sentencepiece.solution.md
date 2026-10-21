## WordPiece (BERT, DistilBERT, ELECTRA)

**Training.** Like BPE it starts from characters and merges pairs, but it picks the merge that maximises the **likelihood of the training data**, which works out to the pair with the highest score:

$$\text{score}(a,b)=\frac{\text{freq}(ab)}{\text{freq}(a)\cdot\text{freq}(b)}$$

BPE merges the most *frequent* pair. WordPiece merges the pair that is most *surprisingly associated*, so it avoids merging a pair just because both parts are common on their own.

**Marking.** Pieces that continue a word carry a `##` prefix: `playing` becomes `play`, `##ing`.

**Encoding.** **Greedy longest-match-first** against the vocabulary: take the longest prefix that is in the vocabulary, then continue on the remainder. If no piece matches, the whole word becomes `[UNK]`.

**Pipeline.** Pre-tokenises on whitespace and punctuation first, often lowercases and strips accents (BERT uncased).

## SentencePiece (T5, Llama 1/2, Gemma, many multilingual models)

SentencePiece is a **library and framework**, not a single algorithm.

- It treats text as a **raw character stream**, with no need for language-specific pre-tokenisation. Whitespace is turned into an ordinary symbol `▁`. This is essential for languages without spaces (Chinese, Japanese, Thai).
- It is **lossless and reversible**: concatenate the pieces and replace `▁` with a space to recover the exact original string.
- It supports two training algorithms:
  - **BPE** (merge-based, as above).
  - **Unigram language model:** start with a large candidate vocabulary, assign each piece a probability, and **iteratively prune** the pieces whose removal hurts the corpus likelihood least (EM-style training). Encoding uses the **Viterbi algorithm** to find the most probable segmentation.
- Unigram can also **sample multiple segmentations** of the same text (**subword regularisation**), which acts as data augmentation for robustness.
- Offers **byte fallback** so unknown characters never become `<unk>`.

## Comparison

| | BPE | WordPiece | SentencePiece |
|---|---|---|---|
| What it is | Algorithm | Algorithm | Toolkit (BPE or Unigram inside) |
| Merge / prune rule | Highest pair frequency | Highest likelihood-based score | BPE rule or Unigram likelihood pruning |
| Encoding | Apply merges in order | Greedy longest match | Merges, or Viterbi (Unigram) |
| Word boundaries | Pre-tokenised | Pre-tokenised, `##` marker | None needed, `▁` marker |
| Unknown handling | Byte-level removes `<unk>` | `[UNK]` | Byte fallback optional |
| Typical models | GPT-2/3/4, Llama 3 | BERT | T5, Llama 2, Gemma |

## When to choose which

- Multilingual or no-whitespace languages: **SentencePiece**.
- Following an existing pre-trained model: **use its tokenizer exactly**; mismatched tokenizers break the model.
- Byte-level BPE is the common default for new decoder-only LLMs because it never fails on any input.
