**Pipeline**

1. **Tokenise** the text into subword tokens (truncated to the model's max length).
2. **Token embeddings + positions:** look up a vector per token and add positional information.
3. **Transformer encoder** layers mix context, so each token vector now depends on the whole sentence.
4. **Pooling:** collapse the variable-length list of token vectors into **one fixed-size vector**.
   - **Mean pooling** (average of token vectors): common default.
   - **CLS pooling:** use the special first-token vector.
   - **Last-token pooling:** used by decoder-based embedding models.
5. **(Optional) projection and L2 normalisation**, so cosine similarity reduces to a dot product.

```python
from sentence_transformers import SentenceTransformer
m = SentenceTransformer("all-MiniLM-L6-v2")
v = m.encode(["How do I reset my password?"], normalize_embeddings=True)
print(v.shape)   # (1, 384): one fixed-size vector per text
```

**How the model learns to do this:** an encoder pretrained for language is then trained **contrastively** on pairs of related texts (query/answer, paraphrases), so related texts land close together and unrelated ones far apart. Without that step, raw pooled hidden states are poor for similarity search.

**Practical points**

- The vector size (384, 768, 1024, 3072...) is fixed by the model.
- Text beyond the max token length is cut off, so **chunk size must fit the model**.
- Some models expect **prefixes** ("query:" / "passage:") for asymmetric search.
- Vectors from different models are **not comparable**.
