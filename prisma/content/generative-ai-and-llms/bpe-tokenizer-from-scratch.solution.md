```python
from collections import Counter

def get_pairs(seq):
    return Counter(zip(seq, seq[1:]))

def merge(seq, pair, new_id):
    out, i = [], 0
    while i < len(seq):
        if i < len(seq) - 1 and (seq[i], seq[i + 1]) == pair:
            out.append(new_id); i += 2
        else:
            out.append(seq[i]); i += 1
    return out

def train_bpe(text, n_merges):
    ids = list(text.encode("utf-8"))                   # start from raw bytes: ids 0..255
    merges = {}                                        # (a, b) -> new token id, in learned order
    for k in range(n_merges):
        pairs = get_pairs(ids)
        if not pairs:
            break
        best = max(pairs, key=lambda p: (pairs[p], p)) # most frequent; ties broken deterministically
        if pairs[best] < 2:
            break                                      # nothing worth merging
        merges[best] = 256 + k
        ids = merge(ids, best, 256 + k)
    return merges

def encode(text, merges):
    ids = list(text.encode("utf-8"))
    while len(ids) >= 2:
        pairs = get_pairs(ids)
        # apply the earliest-learned merge available (lowest rank)
        pair = min(pairs, key=lambda p: merges.get(p, float("inf")))
        if pair not in merges:
            break
        ids = merge(ids, pair, merges[pair])
    return ids

def decode(ids, merges):
    vocab = {i: bytes([i]) for i in range(256)}
    for (a, b), new in merges.items():                 # dict preserves insertion order
        vocab[new] = vocab[a] + vocab[b]
    return b"".join(vocab[i] for i in ids).decode("utf-8", errors="replace")

text = "low lower lowest low low newer newest"
merges = train_bpe(text, 10)
ids = encode("lowest newer", merges)
assert decode(ids, merges) == "lowest newer"           # lossless round trip
print(len(text.encode()), "bytes ->", len(encode(text, merges)), "tokens")
```

**How it works**

- **Training:** start with each byte as a token, repeatedly merge the **most frequent adjacent pair** into a new token. Each merge adds one vocabulary entry; the final vocab size is $256 + n_{merges}$.
- **Encoding:** split into bytes, then apply merges **in the order they were learned**.
- **Byte-level** means any input is representable (no unknown tokens), emojis and other scripts included.

**What real tokenizers add:** a **pre-tokenisation regex** (split on spaces, punctuation, digits so merges do not cross word boundaries), special tokens (`<|endoftext|>`), much faster priority-queue merging, and training on huge corpora. This explains odd token splits for rare words and weaker performance on languages under-represented in the training text.
