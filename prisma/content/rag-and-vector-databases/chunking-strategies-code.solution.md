```python
import re
import numpy as np

# 1. Fixed-size with overlap (characters; use tokens in production)
def fixed_chunks(text, size=500, overlap=50):
    step = size - overlap
    return [text[i:i + size] for i in range(0, max(len(text) - overlap, 1), step)]

# 2. Recursive: split on the biggest separator that keeps pieces under `size`
SEPS = ["\n\n", "\n", ". ", " "]

def recursive_chunks(text, size=500, seps=SEPS):
    if len(text) <= size:
        return [text]
    if not seps:                                   # no separator left: hard cut
        return [text[i:i + size] for i in range(0, len(text), size)]
    sep, rest = seps[0], seps[1:]
    parts, chunks, cur = text.split(sep), [], ""
    for p in parts:
        piece = p if not cur else sep + p
        if len(cur) + len(piece) <= size:
            cur += piece
        else:
            if cur:
                chunks.append(cur)
            if len(p) > size:                      # single part too big: go deeper
                chunks.extend(recursive_chunks(p, size, rest))
                cur = ""
            else:
                cur = p
    if cur:
        chunks.append(cur)
    return chunks

# 3. Semantic: start a new chunk where similarity between neighbours drops
def semantic_chunks(text, embed, threshold=0.55, max_sentences=12):
    sents = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    if not sents:
        return []
    vecs = np.asarray(embed(sents), dtype=float)
    vecs /= np.linalg.norm(vecs, axis=1, keepdims=True)
    chunks, cur = [], [sents[0]]
    for i in range(1, len(sents)):
        sim = float(vecs[i - 1] @ vecs[i])
        if sim < threshold or len(cur) >= max_sentences:
            chunks.append(" ".join(cur))
            cur = []
        cur.append(sents[i])
    chunks.append(" ".join(cur))
    return chunks
```

**Choosing**

| Strategy | Pros | Cons | Use for |
|---|---|---|---|
| Fixed | Trivial, predictable size, fast | Cuts mid-sentence; ignores structure | Baselines, uniform logs |
| Recursive | Respects paragraphs/sentences; cheap | Size-driven, not meaning-driven | **Good default** for prose |
| Semantic | Topic-coherent chunks | Embedding cost; threshold needs tuning; variable size | Long, mixed-topic documents |

**Also:** for Markdown/HTML/code, split on **structure** (headings, functions) first; keep chunks within the embedding model's token limit; measure retrieval recall on a gold set rather than guessing.
