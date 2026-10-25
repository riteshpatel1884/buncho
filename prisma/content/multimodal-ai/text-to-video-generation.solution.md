**Task:** generate a video (often with audio) from text, image(s), or video prompts, with **spatial quality, temporal coherence, motion realism, and prompt fidelity**.

**Core recipe (state of the art): latent diffusion/flow Transformers**

1. **Video VAE (3D/causal):** compress video spatially and temporally (e.g. 8x8 space, 4-8x time) into **latent patches** so sequences are tractable.
2. **Diffusion Transformer (DiT / MMDiT):** denoise space-time latent tokens with full or factorised spatio-temporal attention; modern models use **flow matching/rectified flow** objectives.
3. **Text conditioning:** T5/LLM/CLIP text encoders via cross-attention or joint attention; also image, first/last frame, camera, depth, pose, audio conditions.
4. **Decode** latents with the VAE; add **super-resolution and frame interpolation** stages.
5. **Training:** huge video-text corpora with dense recaptioning (VLM-generated captions), curriculum from images to short clips to longer clips, multiple aspect ratios/durations.

**Systems (as of 2026, evolving fast):** OpenAI Sora 2, Google Veo 3, Runway Gen-4, Kling, Luma Ray, Pika, MiniMax Hailuo, and open models like **Wan 2.x, HunyuanVideo, CogVideoX, LTX-Video, Mochi**. Newer ones add **native synchronised audio/dialogue**, image-to-video, reference-subject consistency and editing.

**Key challenges and techniques**

- **Temporal consistency / identity:** joint space-time attention, reference-image conditioning, character/ID adapters.
- **Physics and motion realism:** large-scale data, better captions, still imperfect (object permanence, contact, fluids).
- **Long videos:** autoregressive/chunked extension, sliding-window diffusion, "diffusion forcing", storyboards plus multi-shot generation.
- **Compute and latency:** minutes per clip; distillation (few-step), sparse/linear attention, quantisation, caching.
- **Control:** camera paths, motion brushes, keyframes, ControlNet-style conditions.
- **Evaluation:** FVD, VBench, human preference; prompt alignment and motion quality.
- **Safety/IP:** deepfakes, likeness consent, copyrighted characters, watermarks and C2PA provenance, moderation of prompts and outputs.
