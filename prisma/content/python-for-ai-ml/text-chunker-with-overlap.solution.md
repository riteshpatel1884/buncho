```python
def chunk_words(text, size=200, overlap=40):
    if size <= 0 or not 0 <= overlap < size:
        raise ValueError("need size > 0 and 0 <= overlap < size")
    words = text.split()
    step = size - overlap
    chunks = []
    for start in range(0, len(words), step):
        chunks.append(" ".join(words[start:start + size]))
        if start + size >= len(words):          # this window already reached the end
            break
    return chunks

chunk_words("a b c d e f g h i j", size=4, overlap=1)
# ['a b c d', 'd e f g', 'g h i j']
```

**Why the `break`.** Without it, the loop would also emit windows that start inside the last chunk and contain only words already covered, producing a redundant tail chunk.

**Edge cases:** empty text returns `[]`; text shorter than `size` returns one chunk; `overlap >= size` would make `step <= 0` (infinite loop or an error), hence the validation.

**Production changes**
- Count **tokens** with the model's tokenizer (e.g. `tiktoken` or the Hugging Face tokenizer), because context limits and embedding models use tokens, not words.
- Prefer **structure-aware** splitting: headings, paragraphs, sentences, code blocks; fall back to fixed windows only when a unit is too large.
- Store **metadata** with each chunk (source, page, character offsets, section title) for citations and filtering, and consider prepending the section heading to the chunk text.
- Overlap preserves context across boundaries but increases index size and duplicate retrievals. Tune `size` and `overlap` against a labelled retrieval set (recall@k), not by feel.
