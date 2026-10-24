**Requirements:** latency of seconds to tens of seconds per image, variations/upscales, style controls, large burst traffic, safe content, cost control, user galleries.

**Architecture**

```text
Client -> API/web -> Auth, quota/credits, rate limit
   -> Prompt safety (text classifier + policy) -> Prompt enhancement/translation (optional LLM)
   -> Job queue (priority by plan, fair share) -> GPU worker pool
        diffusion/flow model (text encoder -> latent denoising loop -> VAE decoder)
        + upscaler / face-detail / LoRA/ControlNet modules
   -> Output safety (image classifier, watermark/C2PA provenance) -> Object store + CDN
   -> Notify (WebSocket/push) -> Gallery metadata DB
```

**Design decisions**

- **Asynchronous jobs:** generation is long; return a job id, stream progress/previews, retry failures, support cancellation.
- **GPU efficiency:** batch compatible requests (same resolution/steps), keep models resident, use fp16/bf16/fp8, fewer sampling steps via distilled models (e.g. 4 to 8 steps), compile/TensorRT, tiling for big outputs.
- **Model management:** many checkpoints/LoRAs/styles; route jobs to workers that already hold the required weights; fast weight swapping.
- **Autoscaling and queues:** scale on queue wait time; priority lanes (paid vs free), spot GPUs for non-urgent work, fair-share limits to stop abuse.
- **Safety:** block disallowed prompts (violence, sexual content, minors, real persons, copyrighted characters, depending on policy), moderate outputs, rate limits, abuse detection, watermarking and provenance metadata, reporting flow.
- **Storage:** images in object storage with CDN, thumbnails, retention policies; store seed and parameters for reproducibility.
- **Cost:** cost per image dominated by GPU seconds; cache identical requests, offer resolution/quality tiers, and credits-based billing.

**Metrics:** queue wait and generation time p95, GPU utilisation, failure rate, cost per image, safety block precision/recall, user satisfaction (keep/upscale rate).
