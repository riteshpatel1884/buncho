## Short answer

An **embedding** is a dense vector of real numbers that represents a discrete item (a token, word, sentence, image, user, product) so that **geometric closeness reflects similarity of meaning or behaviour**. Embeddings are learned from data rather than hand-designed.

## Two things people call "embeddings"

| | Token embedding table inside an LLM | Embedding model for retrieval |
|---|---|---|
| Shape | $$[V, d]$$ lookup table, one row per token | Whole network mapping text to one vector |
| Trained | Together with the LLM | Usually contrastively, so similar texts land close together |
| Context | Same vector for a token regardless of context; context-awareness comes from later layers | Vector summarises the whole input |
| Used for | First layer (and often the output head, via weight tying) | Search, RAG, clustering, deduplication, classification features |

## Measuring similarity

```python
import numpy as np

def cosine(a, b):
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))
```

If vectors are normalised to unit length, cosine similarity equals the dot product, which is why many vector databases store normalised vectors.

## Static vs. contextual

word2vec and GloVe give one vector per word. Transformer models give **contextual** representations, so "bank" in "river bank" and "bank loan" get different vectors.

## Production pitfalls

- **Model lock-in:** vectors from different models live in different spaces and cannot be compared. Changing the embedding model means re-embedding everything.
- **Domain mismatch:** general models may place specialised terms poorly. Evaluate on your own queries, and consider fine-tuning.
- **Dimension trade-off:** more dimensions can capture more, but cost more storage and search time. Some models support truncating dimensions.
- **Length limits:** inputs longer than the model's limit are truncated, so chunk before embedding.
- **High similarity is not relevance:** a high cosine score means "similar", not "answers the question". Hybrid search and reranking close this gap.

## Interview follow-up

*"How do you evaluate an embedding model?"* Build a labelled set of queries with relevant documents from your domain and compare recall@k and MRR across candidate models.
