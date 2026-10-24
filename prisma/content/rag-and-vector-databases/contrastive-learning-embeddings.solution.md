**Idea:** learn a space where **positive pairs are close and negatives are far**, without needing class labels.

**Training data:** pairs $(q, d^+)$ such as question/answer, title/body, query/clicked document, or two augmented views of the same text.

**Loss (InfoNCE):** for a query $q$, positive $d^+$ and negatives $d_j^-$:

$$\mathcal{L} = -\log \frac{\exp(\mathrm{sim}(q,d^+)/\tau)}{\exp(\mathrm{sim}(q,d^+)/\tau) + \sum_j \exp(\mathrm{sim}(q,d_j^-)/\tau)}$$

where $\tau$ is a **temperature**. The loss is a softmax classification: pick the true positive out of the candidates.

**In-batch negatives:** in a batch of $B$ pairs, every other pair's document is a negative for $q_i$. This gives $B-1$ free negatives, which is why **large batch sizes** help.

```python
import torch, torch.nn.functional as F
def info_nce(q, d, tau=0.05):            # q, d: (B, dim), L2-normalised
    logits = q @ d.T / tau               # (B, B): diagonal = positives
    labels = torch.arange(len(q))
    return F.cross_entropy(logits, labels)
```

**Hard negatives:** documents that look relevant but are not (mined from BM25 or an earlier model's top results). They teach fine distinctions and improve retrieval a lot, but **false negatives** (unlabelled true positives) can hurt, so filter them.

**Where it is used:** sentence/text embedding models, CLIP-style image-text models, and domain fine-tuning of retrievers.
