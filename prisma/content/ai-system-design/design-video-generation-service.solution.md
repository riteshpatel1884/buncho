**Requirements:** seconds-long clips (5 to 60 s), text/image/video conditioning, high resolution, minutes per generation, strict safety, controlled cost.

**Architecture**

```text
Client -> API -> auth, credits, quotas
   -> Prompt/asset safety (text, uploaded images, likeness checks)
   -> Prompt expansion (LLM: scene description, camera, style)
   -> Scheduler / job queue (priority, duration/resolution-aware)
   -> GPU cluster: spatiotemporal latent diffusion transformer (denoise video latents)
        -> video VAE decode -> temporal upscaling / frame interpolation -> optional audio model
   -> Output safety (frame sampling classifiers, audio check), watermark + C2PA metadata
   -> Encode (H.264/H.265 ladders) -> object store + CDN
```

**Why it is hard:** video is a long sequence of correlated frames; compute and memory grow with **frames x resolution**. Tokens in a spatiotemporal latent can reach hundreds of thousands per clip.

**Design decisions**

- **Latent space:** compress video with a **3D VAE** before diffusion; generate at lower resolution/frame rate then **upscale** in separate stages (cascades).
- **Parallelism:** sequence/context parallelism across GPUs for one clip; pipeline stages; batch only compatible jobs.
- **Cost control:** quality tiers (resolution, duration), distilled few-step samplers, queue with admission control, credit pricing based on estimated GPU seconds, preview at low resolution first.
- **Consistency controls:** image-to-video, reference frames, seeds, extend/loop, editing via re-noising, so users can iterate without regenerating everything.
- **Fault tolerance:** jobs are long, so **checkpoint** intermediate latents and resume after a worker failure.
- **Safety:** prompt and image policies, likeness/consent protections, deepfake abuse prevention, output classifiers on sampled frames, watermarking, audit logs, human review for flagged content.
- **Delivery:** async notifications, adaptive-bitrate streaming, retention limits.

**Metrics:** GPU-seconds per clip, queue wait, completion rate, prompt adherence (human + automated), temporal consistency, safety false-negative rate, cost per minute of video.
