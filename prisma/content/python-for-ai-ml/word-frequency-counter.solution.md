```python
import re
from collections import Counter

def top_words(text: str, k: int = 5):
    words = re.findall(r"[a-z']+", text.lower())
    return Counter(words).most_common(k)

text = "The cat and the hat. The cat sat; the hat did not."
print(top_words(text, 3))      # [('the', 4), ('cat', 2), ('hat', 2)]
```

**Why `Counter`:** it is a dict subclass optimised for counting; `most_common(k)` uses a heap so it is faster than sorting all items when `k` is small.

**Without `Counter`**

```python
freq = {}
for w in words:
    freq[w] = freq.get(w, 0) + 1
```

**Large files:** stream line by line so memory is bounded by the vocabulary size, not the file size.

```python
def count_file(path):
    c = Counter()
    with open(path, encoding="utf-8") as f:
        for line in f:
            c.update(re.findall(r"[a-z']+", line.lower()))
    return c
```

**NLP notes:** remove stop words for content analysis, use a real tokenizer (spaCy/NLTK) for non-English text, and note that this bag-of-words count is the basis of TF-IDF features.
