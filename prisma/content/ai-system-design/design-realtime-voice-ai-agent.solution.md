**Requirements:** end-to-end response start under about **1 second** (natural turn-taking is roughly 200 to 500 ms between humans), barge-in (user can interrupt), robust to noise and accents, tool use, thousands of concurrent calls.

**Two architectures**

1. **Cascaded pipeline:** `audio -> VAD -> streaming ASR -> LLM (streaming) -> streaming TTS -> audio`. Flexible, debuggable, any model per stage, easy tool use.
2. **Speech-to-speech model:** one model takes audio and emits audio; lower latency, keeps tone and emotion, but less controllable and harder to ground and audit. Many products use cascaded for control and add speech-to-speech where latency matters.

```text
Client (WebRTC/WebSocket, Opus audio)
   -> Media server / gateway -> VAD + turn detector
        -> Streaming ASR (partial transcripts)
             -> Orchestrator: context, memory, tools, guardrails
                  -> LLM (token stream)
                       -> sentence chunker -> Streaming TTS -> audio out
```

**Latency budget (illustrative):** network 50 to 100 ms, end-of-speech detection 200 to 400 ms, ASR finalisation 100 to 200 ms, LLM time-to-first-token 200 to 400 ms, TTS first audio 100 to 200 ms. Everything must **stream**: start TTS on the first sentence/clause while the LLM is still generating.

**Key decisions**

- **Transport:** WebRTC for browsers/mobile (low latency, jitter handling, echo cancellation); telephony via SIP/PSTN gateways.
- **Turn detection:** VAD plus a semantic end-of-turn model, to avoid cutting people off or waiting too long.
- **Barge-in:** when user speech is detected during playback, stop TTS immediately, cancel the LLM request, and keep only the portion actually spoken in the history.
- **Prompting for speech:** short answers, no markdown, spoken numbers and dates.
- **Tool calls:** filler phrases ("let me check") while tools run; strict timeouts.
- **Co-locate** ASR, LLM and TTS in one region; keep models warm; use smaller/faster LLMs for conversational turns and escalate to larger ones when needed.

**Failure handling:** ASR errors (confirm critical entities such as names, numbers), dropped connection (reconnect and resume), LLM timeout (canned fallback or human handoff), TTS failure (fallback voice), audio quality issues.

**Safety and compliance:** consent and call-recording rules, PII redaction in transcripts, prompt injection through spoken content, identity verification before sensitive actions.

**Metrics:** time to first audio (p50/p95), interruption handling success, word error rate, task completion, call abandonment, cost per minute, concurrent sessions per GPU.
