**Goal:** natural conversation has gaps of about 200-300 ms between human turns; voice agents are usually acceptable at **about 800-1200 ms voice-to-voice** (end of user speech to first agent audio), with under 800 ms excellent.

**Typical budget (cascaded pipeline)**

| Stage | Typical | Notes / levers |
|---|---|---|
| **Audio capture + network up** | 20-100 ms | WebRTC/UDP, nearby region, jitter buffer minimal |
| **VAD / end-of-turn detection (endpointing)** | **200-500 ms** | Silence timeout is usually the **largest hidden cost**; semantic turn detection trades latency vs interruptions |
| **ASR (streaming)** | 50-200 ms after speech ends | Streaming partials already computed; final hypothesis only needs a tail |
| **LLM time-to-first-token** | **250-700 ms** | Small/fast model, prompt caching, short context, regional endpoint, streaming |
| **Tool/RAG call (if any)** | 200-1500 ms | Parallelise, cache, filler phrases |
| **TTS time-to-first-audio** | 100-300 ms | Streaming TTS, sentence/clause chunking |
| **Network down + playout buffer** | 50-150 ms | Small buffer, codec (Opus) |
| **Total** | **~700-1500 ms** | |

**Voice-to-voice latency:** timestamp end-of-speech (ground truth from audio, not the VAD event) and first audible agent audio; report p50/p95/p99 and per-stage traces. **Time-to-first-audio** matters more than total length because users judge responsiveness by when the agent starts replying.

**Optimisations**

1. **Overlap stages:** stream ASR while the user speaks; stream LLM tokens into TTS as soon as a **sentence/clause** is complete; start TTS playback before the LLM finishes.
2. **Tune endpointing:** adaptive silence thresholds, semantic end-of-turn models; **speculative generation** after a tentative end of turn.
3. **Faster models and caching:** small LLM or router (easy queries to a tiny model), prompt/prefix caching, quantisation, warm connections, co-locate services.
4. **Hide tool latency** with filler phrases, parallel tool calls and prefetching.
5. **Network:** WebRTC, regional edge, avoid extra hops and TLS handshakes per request.
6. **Alternatively** use a speech-to-speech model to remove the ASR/TTS stages.

Track P95 under load; the tail drives perceived quality.
