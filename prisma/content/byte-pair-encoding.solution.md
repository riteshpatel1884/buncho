## Short answer

**Byte Pair Encoding** builds a vocabulary by starting from single characters (or bytes) and repeatedly merging the most frequent adjacent pair of symbols into a new symbol, until the vocabulary reaches a target size. The ordered list of merges *is* the tokenizer.

## Training algorithm

1. Split every word in the corpus into characters, add an end-of-word marker, and keep word counts.
2. Count every adjacent symbol pair, weighted by word frequency.
3. Merge the most frequent pair everywhere and record the merge.
4. Repeat until you have done the desired number of merges.

## Worked example

Corpus counts: `low` x5, `lower` x2, `newest` x6, `widest` x3 (`</w>` marks the end of a word).

| Merge | Pair | Count | New symbol |
|---|---|---|---|
| 1 | e + s | 9 (tied with s+t and t+`</w>`; any tie-break is valid) | `es` |
| 2 | es + t | 9 | `est` |
| 3 | est + `</w>` | 9 | `est</w>` |
| 4 | l + o | 7 (tied with o+w) | `lo` |
| 5 | lo + w | 7 | `low` |

After five merges, `newest` is `n e w est</w>` and `widest` is `w i d est</w>`, so the shared suffix is now a single token.

## Encoding new text

Split into characters, then apply the learned merges **in the order they were learned**. For the unseen word `lowest`: `l o w e s t </w>` becomes `low` + `est</w>`. Unseen words are always representable because single characters are in the vocabulary.

## Code

```python
from collections import Counter

def get_pairs(words):  # words: {tuple(symbols): frequency}
    pairs = Counter()
    for symbols, freq in words.items():
        for a, b in zip(symbols, symbols[1:]):
            pairs[(a, b)] += freq
    return pairs

def merge(words, pair):
    merged = {}
    for symbols, freq in words.items():
        out, i = [], 0
        while i < len(symbols):
            if i < len(symbols) - 1 and (symbols[i], symbols[i + 1]) == pair:
                out.append(symbols[i] + symbols[i + 1])
                i += 2
            else:
                out.append(symbols[i])
                i += 1
        key = tuple(out)
        merged[key] = merged.get(key, 0) + freq
    return merged

def train_bpe(word_counts, num_merges):
    words = {tuple(w) + ("</w>",): c for w, c in word_counts.items()}
    merges = []
    for _ in range(num_merges):
        pairs = get_pairs(words)
        if not pairs:
            break
        best = max(pairs, key=pairs.get)
        merges.append(best)
        words = merge(words, best)
    return merges

def encode(word, merges):
    symbols = tuple(word) + ("</w>",)
    for pair in merges:                      # apply in learned order
        symbols = next(iter(merge({symbols: 1}, pair)))
    return list(symbols)

merges = train_bpe({"low": 5, "lower": 2, "newest": 6, "widest": 3}, 5)
print(encode("lowest", merges))              # ['low', 'est</w>']
```

## Byte-level BPE

GPT-2 and most modern LLM tokenizers run BPE over UTF-8 **bytes** (a base vocabulary of 256), usually after a regex pre-split into words, numbers and punctuation. Any string can be encoded, so there is no unknown token.

## Trade-offs

- Merges are frequency-based, so they reflect the training corpus. Text unlike it (other languages, code) is split into more tokens.
- Naive training recounts pairs on every merge; production implementations update counts incrementally.

## Interview follow-up

*"How is WordPiece different?"* It also merges pairs, but picks the pair that maximises a likelihood-based score rather than raw frequency.
