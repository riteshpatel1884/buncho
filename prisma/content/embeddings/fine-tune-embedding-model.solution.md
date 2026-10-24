**First try cheaper fixes:** hybrid search (BM25 handles jargon), better chunking, query rewriting, a reranker, or a stronger off-the-shelf model. Fine-tune when a gold-set evaluation shows a persistent **domain gap**.

**1. Data: (query, relevant passage) pairs**

- **Real:** search logs with clicks, support tickets linked to articles, expert labels.
- **Synthetic:** an LLM writes questions for each chunk (then filter low-quality ones).
- **Hard negatives:** passages ranked highly by the base model that are **not** relevant; add them to the training data (screen for false negatives).
- Hundreds to a few thousand good pairs often give measurable gains.

**2. Train (contrastive loss)**

```python
from sentence_transformers import SentenceTransformer, losses, InputExample
from torch.utils.data import DataLoader
model = SentenceTransformer("BAAI/bge-base-en-v1.5")
ex = [InputExample(texts=[q, pos, neg]) for q, pos, neg in triples]
dl = DataLoader(ex, shuffle=True, batch_size=64)           # larger batch = more in-batch negatives
loss = losses.MultipleNegativesRankingLoss(model)
model.fit(train_objectives=[(dl, loss)], epochs=1, warmup_steps=100)
```

Use a **small learning rate** and few epochs to avoid forgetting; consider adapter/LoRA training to cut cost.

**3. Evaluate:** hold out queries (split by **document**, not just by query to avoid leakage), compare recall@k/nDCG vs the base model, and also check a **general benchmark** for regressions.

**4. Deploy:** you now have a **new vector space**, so **re-embed the entire corpus** and run both encoders side by side (blue/green index). Version the model; keep monitoring.

**Alternatives:** train only a **linear adapter** on query embeddings (no re-indexing of documents), or fine-tune a **reranker** instead, which needs no re-embedding.
