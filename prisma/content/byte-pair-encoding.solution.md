## Idea

BPE builds a subword vocabulary by **repeatedly merging the most frequent adjacent pair** of symbols. Frequent words end up as single tokens; rare words decompose into smaller known pieces.

## Training algorithm

1. **Pre-tokenise** the corpus into words and count word frequencies.
2. Start with a vocabulary of **single characters** (or bytes). Represent each word as a sequence of symbols.
3. Count all adjacent symbol pairs across the corpus, weighted by word frequency.
4. **Merge** the most frequent pair into a new symbol, add it to the vocabulary, and record the merge rule (in order).
5. Repeat until the vocabulary reaches the target size $V$.

The output is the vocabulary plus an **ordered list of merges**.

## Worked example

Corpus word counts: `low`×5, `lower`×2, `newest`×6, `widest`×3. Use `</w>` as an end-of-word marker.

Start: `l o w </w>`(5), `l o w e r </w>`(2), `n e w e s t </w>`(6), `w i d e s t </w>`(3).

- Most frequent pairs: `(e,s)`=9, `(s,t)`=9, `(t,</w>)`=9 (a tie, broken by a fixed rule). Merge **e+s → es**.
- Next: `(es,t)`=9, so merge **es+t → est**.
- Next: `(est,</w>)`=9, so merge **est+</w> → est</w>**.
- Next: `(l,o)`=7, merge **l+o → lo**.
- Next: `(lo,w)`=7, merge **lo+w → low**.

After 5 merges, `newest` is `n e w est</w>` and `low` is `low </w>`.

## Encoding new text

Split the word into base symbols, then apply the learned merges **in the same priority order** they were learned (not by re-counting). An unseen word like `lowest` becomes `low` + `est</w>`.

## Byte-level BPE (GPT-2 onward)

- The base alphabet is the **256 byte values** of UTF-8, not characters.
- **No unknown token is ever needed**: any string, any language, emoji or binary can be encoded.
- A **pre-tokenisation regex** stops merges across categories (for example letters and punctuation), which keeps tokens clean.
- Cost: non-Latin scripts take several bytes per character, so they can need more tokens.

## Properties and trade-offs

- **Deterministic** and greedy: it is a compression-like scheme, not a probabilistic model.
- Vocabulary size is a trade-off: larger means shorter sequences but a bigger embedding and output matrix and rarer, less-trained tokens.
- Learned only from the tokenizer training corpus, so domain text it never saw is split inefficiently.

## Minimal training loop (Python)

```python
from collections import Counter

def get_pairs(words):          # words: {tuple(symbols): freq}
    pairs = Counter()
    for symbols, freq in words.items():
        for a, b in zip(symbols, symbols[1:]):
            pairs[(a, b)] += freq
    return pairs

def merge(words, pair):
    out = {}
    for symbols, freq in words.items():
        new, i = [], 0
        while i < len(symbols):
            if i < len(symbols) - 1 and (symbols[i], symbols[i + 1]) == pair:
                new.append(symbols[i] + symbols[i + 1]); i += 2
            else:
                new.append(symbols[i]); i += 1
        out[tuple(new)] = freq
    return out

def train_bpe(words, num_merges):
    merges = []
    for _ in range(num_merges):
        pairs = get_pairs(words)
        if not pairs:
            break
        best = max(pairs, key=pairs.get)
        words = merge(words, best)
        merges.append(best)
    return merges
```
