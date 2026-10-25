**Turn-taking** is the coordination of who speaks when. The agent must decide **when the user has finished** (end-of-turn, EOT) and when it may be interrupted.

**Methods (increasing sophistication)**

1. **Silence-based VAD endpointing:** voice activity detector (WebRTC VAD, Silero VAD) flags speech; if silence lasts longer than a threshold (e.g. 500-800 ms), the turn ends. Simple but forces a trade-off: short thresholds cut people off mid-thought ("My number is... five five five"), long ones add dead air.
2. **Acoustic/prosodic cues:** falling pitch, lengthening, energy drop.
3. **Semantic / text-based EOT models:** a small model reads the ASR transcript so far and predicts whether the utterance is **complete** ("What's the weather" vs "I want to book a flight to"). Used by LiveKit's turn detector, Pipecat Smart Turn (audio-based), Deepgram Flux, etc.
4. **Combine signals:** adaptive timeouts: after a complete-looking sentence wait ~200-300 ms, after an incomplete one wait up to 1-2 s; dynamic by context (digits, spelling, hesitations "um...").
5. **Native full-duplex speech models** (Moshi, GPT-4o-style realtime) model both streams and learn turn-taking implicitly.

**Related behaviours**

- **Barge-in:** the user speaks while the agent talks, so stop TTS, flush buffers, truncate the context to what was actually spoken.
- **Backchannels** ("mm-hmm") should not be treated as interruptions (use minimum duration/word count or classifier).
- **False triggers:** noise, echo (use echo cancellation), side conversations.

**Evaluate:** false-cutoff rate vs added latency curves, interruption handling accuracy, user satisfaction, A/B tests of thresholds. Tune per use case: a phone ordering bot versus a language tutor.
