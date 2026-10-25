**Challenges and mitigations**

| Challenge | Why hard | Mitigations |
|---|---|---|
| **Latency** | Encoders for image/video/audio are heavy, sequential stages add up, long visual token sequences slow prefill | Streaming everywhere, smaller/quantised encoders, frame sampling, token pruning/merging, caching, speculative decoding, edge inference |
| **Synchronisation** | Audio, video, text arrive at different rates and delays; lip-sync, timestamps, drift | Common clock/timestamps, jitter buffers, windowed alignment, event-time processing |
| **Throughput and cost** | Video = thousands of frames per minute; each image = hundreds of tokens | Keyframe/scene-change selection, adaptive fps, resolution tiers, process only on triggers (motion/VAD), batching |
| **Context and memory** | Continuous streams exceed context; need to remember what happened earlier | Rolling windows, summarised memory, KV-cache eviction/compression, retrieval over past frames |
| **Streaming model support** | Many VLMs expect complete inputs; ASR/TTS chunk boundaries cause artefacts | Streaming encoders, incremental decoding, chunked prefill, native realtime APIs |
| **Quality vs speed** | Lower resolution misses small text and details | Dynamic resolution, region-of-interest crops, two-pass (fast detector then detailed VLM) |
| **Network and bandwidth** | Sending raw video/audio is expensive; packet loss | WebRTC, adaptive bitrate, on-device pre-processing, compression with task-aware quality |
| **Robustness** | Noise, occlusion, lighting, accents, overlapping speakers | Pre-filters (denoising, AEC), multi-condition training, fallbacks across modalities |
| **Interaction** | Turn-taking, interruptions, partial results | Barge-in, incremental UI updates, confidence-aware prompts |
| **Reliability and scaling** | GPU hotspots, tail latency, stateful sessions | Session-affine routing, autoscaling with warm pools, backpressure and load shedding, graceful degradation (drop video, keep audio) |
| **Privacy and safety** | Live camera/mic data, bystanders, consent | On-device processing, redaction/blurring, minimal retention, indicators and consent |
| **Evaluation** | Hard to test live behaviour | Replay harness with recorded streams, latency SLO dashboards, scenario tests |

**Architecture pattern:** capture → lightweight on-device/edge filters (VAD, motion, detector) → stream to inference with timestamps → fused reasoning on selected evidence → streaming response, with budgets per stage and a degrade path when over budget.
