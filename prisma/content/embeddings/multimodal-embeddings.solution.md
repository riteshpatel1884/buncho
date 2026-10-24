**Multimodal embeddings** map different data types (text, images, audio, video) into **one shared vector space**, so a caption and a matching image land close together and can be compared with ordinary similarity measures.

**How they are generated (CLIP-style)**

1. A **separate encoder per modality**: a vision encoder (ViT/CNN) for images, a text transformer for text.
2. Each outputs a vector, projected to the **same dimension** and normalised.
3. **Contrastive training** on hundreds of millions of image-caption pairs: within a batch, matching pairs are pulled together and all non-matching pairs are pushed apart (symmetric InfoNCE loss).

```python
# image-text similarity with a CLIP-style model
img_vec = model.encode_image(image)      # (1, d)
txt_vec = model.encode_text(["a photo of a dog"])
score = (img_vec @ txt_vec.T)            # high if the caption matches
```

**Other approaches:** unified multimodal models that embed interleaved image+text inputs; document-image retrievers that embed page screenshots directly (skipping OCR).

**Uses**

- **Text-to-image search** and image-to-image search.
- **Zero-shot classification:** compare an image with text labels.
- **Multimodal RAG:** retrieve images, charts or PDF pages with a text question.
- Recommendations and de-duplication across media.

**Caveats**

- Cross-modal similarity scores are usually **lower** and less calibrated than same-modal ones.
- Fine detail (small text, counting, spatial relations) is weak; combine with OCR or captioning when precision matters.
- Both modalities must use the **same model**; index with a vector DB as usual.
