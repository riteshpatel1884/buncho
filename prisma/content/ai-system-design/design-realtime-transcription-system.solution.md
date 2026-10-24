**Requirements:** thousands of concurrent streams, partial transcripts within about 300 ms and finals shortly after pauses, multi-language, diarisation, punctuation, custom vocabulary, resilient to network jitter.

**Architecture**

```text
Clients (WebSocket/gRPC/WebRTC; Opus/PCM 16 kHz) -> Edge/ingress (auth, quotas, session routing)
   -> Stream session manager (sticky routing, reconnect/resume, back-pressure)
   -> Audio pre-processing: resample, VAD (drop silence), noise suppression, chunking (e.g. 160 to 320 ms frames)
   -> Streaming ASR (GPU inference pool): chunked/streaming encoder + decoder (e.g. streaming Conformer/Transducer/CTC,
        or chunked Whisper-style with overlap) with batching across streams
   -> Post-processing: punctuation/casing, ITN (numbers/dates), custom vocab biasing, profanity/PII redaction
   -> Diarisation (speaker embeddings + clustering, online) -> Output: partial/final events over the same socket
   -> Persistence: audio + transcript storage, analytics, downstream (summaries, captions, agents)
```

**Design decisions**

- **Streaming model:** needs bounded latency; use **streaming architectures** (RNN-T/Conformer-transducer, chunked attention) or chunk-and-stitch with context overlap; emit **partial hypotheses** that get revised and **final** segments at endpoint detection.
- **GPU efficiency:** dynamic batching across many streams (frames from different sessions batched per step), per-stream state (encoder caches) kept in GPU memory, so the number of concurrent streams per GPU is bounded by state memory; scale out with sticky session routing.
- **Latency budget:** frame size + network + model step + post-processing; endpointing tuned (too aggressive truncates sentences, too lax adds delay).
- **Reliability:** session resume with audio buffering, graceful behaviour on overload (reject new streams with a clear error, or degrade to smaller model), regional deployment near users.
- **Quality:** language identification, domain adaptation via vocabulary boosting, noise robustness, accent coverage; a second **offline re-transcription pass** with a larger model for the stored record.
- **Cost:** VAD to skip silence, smaller model for English-only/simple cases, spot instances for batch workloads, autoscaling on active streams.
- **Privacy:** encryption in transit/at rest, consent, retention limits, on-prem option.

**Metrics:** word error rate by language/domain, partial-result latency and final latency, real-time factor, concurrent streams per GPU, stream failure/reconnect rate, cost per audio hour.
