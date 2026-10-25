**Cost drivers**

- **Visual tokens:** an image becomes hundreds to thousands of tokens (tile-based: e.g. 85 + 170/tile in some APIs; high-res documents 1-4k+ tokens). Video multiplies by frames. Audio is charged per minute or audio tokens (often several times text price).
- **Encoders:** ViT/audio encoders add prefill compute; generation models (diffusion/video) are GPU-heavy per output.
- **Output modalities:** image/audio/video generation costs far more than text.
- **Storage and bandwidth:** large media, egress, retention.
- **Human review** for moderation/quality.

**Latency drivers:** upload and decode time, image preprocessing/tiling, vision-encoder + prefill time (grows with token count), time-to-first-token, decoding speed, TTS/diffusion steps, network.

**Optimisation levers**

| Lever | Effect |
|---|---|
| **Right-size inputs:** downscale, crop to region of interest, grayscale where fine, lower `detail` setting, send only relevant pages/frames | Fewer visual tokens |
| **Preprocess cheaply:** classical OCR, detectors, VAD, scene-change filters decide whether the expensive model must run | Skips calls |
| **Model routing/cascades:** small VLM first, escalate on low confidence; text-only model when no visual dependence | Cost and latency down |
| **Caching:** image-embedding cache, prompt/prefix caching (images placed first), result caching by perceptual hash | Reuse |
| **Batching and async** for offline jobs; batch APIs (about 50% cheaper) | Throughput |
| **Serving:** quantisation (INT8/FP8/AWQ), vLLM/SGLang with continuous batching, tensor parallelism, speculative decoding, chunked prefill | Faster and cheaper |
| **Token compression:** pooling/merging visual tokens, Q-Former style resamplers | Shorter sequences |
| **Streaming** responses and early audio | Perceived latency |
| **Diffusion speed-ups:** distillation, fewer steps | See sampling speed question |
| **Edge/on-device** for privacy and bandwidth | Latency and cost |
| **Budget controls:** per-request caps on images/frames/pages, quotas, alerts, per-feature cost dashboards | Predictability |

**Measure** cost per successful task and p50/p95 latency by modality; run quality-vs-cost experiments (resolution sweeps) to find the cheapest setting that still meets accuracy targets.
