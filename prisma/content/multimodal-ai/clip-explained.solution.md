**CLIP (Contrastive Language-Image Pre-training, OpenAI 2021)** trains an **image encoder** (ViT/ResNet) and a **text encoder** (Transformer) on ~400M web image-caption pairs so matching pairs have similar embeddings.

**Objective:** for a batch of $N$ pairs, compute the $N \times N$ similarity matrix $S_{ij} = \tau\, \hat v_i^\top \hat t_j$ (normalised embeddings, learned temperature $\tau$). Apply symmetric cross-entropy: each image should pick its own caption among $N$ and each caption its own image (the diagonal are positives; off-diagonals are negatives).

```python
logits = scale * img_emb @ txt_emb.T                      # (N, N)
labels = torch.arange(N)
loss = (F.cross_entropy(logits, labels) + F.cross_entropy(logits.T, labels)) / 2
```

**Zero-shot classification:** embed prompts like "a photo of a {class}", embed the image, pick the most similar text. No task-specific training needed.

**Why important**

- Created a **shared image-text embedding space**, enabling text-to-image search, zero-shot recognition, filtering datasets (LAION), and open-vocabulary detection/segmentation.
- Its vision encoder became the standard front-end of **VLMs** (LLaVA etc.); its text encoder conditions **diffusion models** (Stable Diffusion; also used to score image-text alignment).
- Scales with web-scale weak supervision rather than manual labels; robust across distribution shift.

**Limitations:** weak at counting, spatial relations, fine-grained detail, and OCR-heavy tasks; bag-of-words behaviour (struggles with attribute binding and negation); web biases; large batches needed (SigLIP's sigmoid loss relaxes this); prompt sensitivity.

**Successors:** OpenCLIP, SigLIP/SigLIP 2, EVA-CLIP, ALIGN, ImageBind (more modalities).
