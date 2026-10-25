An **image embedding** is a dense vector (e.g. 512 to 1536 dimensions) such that **similar images (or concepts) are close** under cosine/dot-product distance.

**How they are produced**

- **CNN/ViT backbone** maps pixels to features; a pooling step (global average pooling, CLS token) gives one vector; a projection head and **L2 normalisation** finish it.
- **Training objectives**
  - **Supervised classification:** penultimate layer features (ImageNet-style).
  - **Self-supervised:** SimCLR/MoCo (contrastive augmentations), BYOL/DINO/DINOv2 (self-distillation), MAE (masked reconstruction).
  - **Image-text contrastive:** CLIP/SigLIP, pulling matching image/caption pairs together; embeddings then capture **semantics** and align with text.
- Metric learning (triplet loss, ArcFace) for faces/products.

**Uses:** similarity and reverse-image search, deduplication, clustering, recommendations, zero-shot classification, retrieval for multimodal RAG, anomaly detection, few-shot learning.

```python
import torch, open_clip
from PIL import Image
model, _, pre = open_clip.create_model_and_transforms("ViT-B-32", pretrained="laion2b_s34b_b79k")
with torch.no_grad():
    v = model.encode_image(pre(Image.open("cat.jpg")).unsqueeze(0))
    v = v / v.norm(dim=-1, keepdim=True)         # unit length: dot product = cosine similarity
# store in a vector DB (FAISS/pgvector), query with cosine/ANN
```

**Practice:** choose a model matching the task (DINOv2 for visual similarity; CLIP/SigLIP for semantic/text queries), use consistent preprocessing, handle crops/tiles for large images, fine-tune on domain data for specialised retrieval (medical, fashion), and evaluate with recall@k on labelled pairs.
