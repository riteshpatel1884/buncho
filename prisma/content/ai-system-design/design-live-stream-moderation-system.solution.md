**Challenge vs normal moderation:** content is unbounded, unreviewable in advance and can turn harmful at any second; **latency matters** (seconds), compute per stream is continuous, and harm can be severe (violence, self-harm, CSAM, terrorism).

**Architecture**

```text
Live ingest (RTMP/WebRTC) -> Transcoding -> Sampling taps:
   video: keyframe/short-clip sampling (adaptive rate) -> vision classifiers/VLM -> per-policy scores
   audio: streaming ASR + audio classifiers (hate speech, threats, gunshots, screaming)
   chat: text moderation on live chat
   metadata: streamer reputation, reports, viewer spikes, prior strikes
   -> Temporal aggregation (rolling windows, smoothing, multi-signal fusion) -> risk score per stream
   -> Decision engine (thresholds by severity & streamer trust):
        low: log | medium: warn streamer, limit discovery, delay/blur, queue human review (live reviewers)
        high: auto-cut/interrupt, ban, escalate to trust & safety / law enforcement workflows
   -> Evidence capture (clips, transcripts) -> Appeals & audit
```

**Design decisions**

- **Tiered compute:** cheap models on every stream at low frame rates (e.g. 1 frame every few seconds); **escalate sampling rate and run heavier VLMs** only when risk is elevated, reported or the stream is popular (viewer-weighted prioritisation, since harm scales with audience).
- **Latency targets:** detect-to-action within about 5 to 15 seconds for severe categories; consider a **short broadcast delay** (e.g. 5 to 10 s) for high-risk or new streamers so interventions can happen before viewers see content.
- **Multimodal fusion and temporal context:** single-frame classifiers cause false positives (a movie scene, video game violence, news footage); use sequence context, audio, chat and streamer history.
- **Hash matching** against known-bad content and live re-upload detection.
- **Human review:** live ops queue prioritised by severity x audience, with clips and rolling context; reviewer wellbeing tooling (blur/greyscale, exposure limits).
- **Streamer experience:** warnings and appeals; trust tiers (verified partners vs new accounts get different thresholds).
- **Scale and cost:** GPU inference with batching across streams, edge/regional inference near ingest, sampling controls to hold cost per stream-hour; autoscaling for events.
- **Adversarial behaviour:** evasion (overlays, filters, code words), coordinated raids; red-team continuously.

**Metrics:** time to detect and time to action by category, precision/recall, viewers exposed before takedown, false-removal rate, appeal overturn rate, cost per stream-hour.
