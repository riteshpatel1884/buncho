**Idea:** keep the *efficiency* of precomputing document representations (like a bi-encoder) but avoid compressing everything into **one** vector. ColBERT keeps **one embedding per token** and lets query and document tokens interact **late**, at scoring time.

**Pipeline**

1. **Index time:** encode every document into a matrix of token embeddings (`n_d x dim`); store them.
2. **Query time:** encode the query into token embeddings (`n_q x dim`).
3. **MaxSim scoring:** for each query token, take its maximum similarity over all document tokens; sum over query tokens:

`score(q, d) = sum_i max_j  q_i . d_j`

```python
import torch
def maxsim(Q, D):                     # Q: [n_q, dim], D: [n_d, dim] (L2-normalised)
    sim = Q @ D.T                     # [n_q, n_d]
    return sim.max(dim=1).values.sum()
```

Each query word finds its best match in the document, so exact terms and fine-grained matching are preserved.

**Comparison**

| | Bi-encoder | ColBERT | Cross-encoder |
|---|---|---|---|
| Doc representation | 1 vector | n token vectors | none (joint input) |
| Interaction | Dot product only | Late, token-level | Full attention |
| Precompute docs | Yes | Yes | No |
| Quality | Good | Close to cross-encoder | Best |
| Speed / cost | Fastest | Medium | Slowest |
| Storage | Small | **Large** (tokens x dim per doc) | None |

**Costs and mitigations:** index size is large; use residual compression, quantisation and candidate generation with centroid pruning (ColBERTv2, PLAID). Used as a first-stage retriever or as an efficient reranker, and common in multi-vector and multimodal variants (ColPali).
