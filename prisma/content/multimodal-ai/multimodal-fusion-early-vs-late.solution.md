**Fusion** = how information from several modalities is combined.

| | **Early fusion** | **Intermediate / hybrid (mid) fusion** | **Late fusion** |
|---|---|---|---|
| Where | Raw inputs or low-level features concatenated/tokenised together, one model processes jointly | Separate encoders, then interact through cross-attention, co-attention, or projector into a shared backbone | Separate models/branches make predictions, then **combine outputs** (average, weighted vote, stacking, gating) |
| Interaction | Learns **fine-grained cross-modal relations** from the start | Rich interaction at selected layers | Only at decision level |
| Examples | Unified token Transformers (Chameleon, Gemini-style native multimodal); concatenating image-patch and text tokens | Flamingo, BLIP-2 (Q-Former), LLaVA (projector + LLM), VilBERT | CLIP-style dual encoders for retrieval (interaction only via similarity), ensembling an image classifier and a text classifier, sensor ensembles |
| Pros | Highest ceiling; captures correlations/timing | Reuses strong pretrained unimodal models; efficient | Modular, easy to train/debug, **robust to missing modalities**, async inputs, parallel |
| Cons | Needs large paired data and compute; hard alignment; sensitive to missing modality | Design complexity; alignment stage required | Misses cross-modal cues ("the word 'this' refers to that object"), no joint reasoning |

```python
# late fusion: weighted average of per-modality probabilities
p = w_img * p_img + w_txt * p_txt + w_aud * p_aud        # weights from validation or learned gating
# early fusion: one sequence of tokens
tokens = concat([text_tokens, project(vit(image))]); logits = transformer(tokens)
```

**Choosing**

- **Late:** small data, independent modalities, missing-data tolerance, regulated/modular systems, quick baselines.
- **Mid:** most practical today: pretrained encoder + connector + LLM.
- **Early/native:** frontier-scale training, tight cross-modal generation (interleaved text/image/audio), when you control the full pretraining.

**Tips:** handle **modality dropout** in training for robustness, normalise embedding scales, align time across streams, and check that the model truly uses every modality (modality ablation tests).
