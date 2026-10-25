**Multimodal models** take and/or produce more than one modality (text, image, audio, video, documents, sensor data).

**General recipe**

1. **Modality encoder** converts raw input to vectors: text tokenizer + embeddings; image via ViT/CNN patches; audio via log-Mel spectrogram + Transformer (Whisper-style) or neural codec tokens; video as frames or space-time patches.
2. **Alignment into a shared space** so the backbone can relate modalities: contrastive pretraining (CLIP), a **projector** (linear/MLP/Q-Former/cross-attention resampler) mapping visual features to LLM embedding space, or discrete tokens for everything.
3. **Backbone** (usually a Transformer/LLM) reasons over the combined sequence.
4. **Decoders/heads** generate text, or via diffusion/codec decoders produce images, audio and video.

**Key architecture families**

| Family | How | Examples |
|---|---|---|
| **Dual encoder (contrastive)** | Separate encoders, aligned embeddings; for retrieval/zero-shot | CLIP, SigLIP, ImageBind |
| **Encoder + projector + LLM (adapter style)** | Frozen/fine-tuned vision encoder, small connector, LLM consumes image tokens as soft prompts | LLaVA, Qwen-VL, InternVL |
| **Cross-attention fusion** | LLM layers cross-attend to visual features | Flamingo, Llama 3.2 Vision |
| **Natively multimodal / unified token** | One Transformer trained from scratch on interleaved tokens of all modalities (early fusion) | Gemini, GPT-4o-class, Chameleon |
| **Encoder-decoder diffusion/generative** | Text conditioning model + diffusion/flow decoder | Stable Diffusion, Flux, Sora-style |
| **Tool/pipeline composition** | Separate specialist models chained by an orchestrator | OCR + LLM, ASR + LLM + TTS |

**Building an image + text application**

```python
# image + question -> answer, using any VLM API
resp = client.chat(model="vlm", messages=[{"role": "user", "content": [
    {"type": "image", "data": img_bytes}, {"type": "text", "text": "What is the total on this invoice?"}]}])
```

Decide: native VLM vs pipeline (OCR/layout then LLM), image resolution/tiling, caching image embeddings, retrieval (image+text embeddings) for large corpora, evaluation set with image-grounded questions, guardrails for image-borne injection, and cost (images consume hundreds to thousands of tokens).
