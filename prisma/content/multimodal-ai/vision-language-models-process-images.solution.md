**Pipeline**

```text
image -> resize/tile -> patches (e.g. 14x14 px) -> ViT vision encoder -> visual tokens
      -> projector (MLP / Q-Former / resampler) -> LLM embedding space
text  -> tokenizer -> embeddings ------------------------------^   -> LLM -> text answer
```

1. **Preprocess:** resize/normalise; high-resolution models split the image into **tiles** (AnyRes/dynamic resolution) plus a thumbnail so small text stays readable.
2. **Patch + ViT encoder:** the image is cut into patches, each linearly embedded with positional information and processed by Transformer layers (CLIP/SigLIP-pretrained encoders are common) giving, e.g., 256 to 576 patch features per tile.
3. **Connector/projector:** maps vision features to LLM token-embedding dimension. A **linear/MLP** keeps all tokens (LLaVA); **Q-Former/Perceiver resampler** compresses to a fixed number of query tokens (BLIP-2, Flamingo); pooling/token merging to cut cost.
4. **LLM backbone:** image tokens are inserted into the sequence (at an `<image>` placeholder) and attended like text, so the LLM can describe, reason, read text, answer questions.
5. **Output:** autoregressive text (some models also emit boxes, points or masks as tokens).

**Training stages**

1. **Alignment pretraining:** image-caption pairs; train the projector (encoder and LLM frozen).
2. **Visual instruction tuning:** instruction/VQA/OCR/chart/document data; unfreeze LLM (and often the encoder), often with LoRA.
3. **Preference/safety tuning** (RLHF/DPO) to reduce hallucination.

**Practical consequences:** token count scales with resolution (cost, latency, context use); fine details (small text, counting, spatial relations) depend on resolution and encoder quality; the model reasons over the *encoded* image, so information lost by the encoder cannot be recovered by the LLM.
