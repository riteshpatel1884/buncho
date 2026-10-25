**Idea:** the endpointing delay (200-800 ms of silence) is dead time. **Speculative/preemptive generation** starts the LLM (and optionally TTS synthesis) on the **partial or tentative final transcript** as soon as the user *probably* finished, in parallel with waiting to confirm the turn really ended.

**Flow**

```text
user stops -> ASR gives tentative final text -> start LLM request now (speculative)
  ├─ silence continues until confirm timeout -> commit: play buffered audio (saved the wait)
  └─ user resumes / transcript changes     -> cancel request, discard audio, re-run on the new text
```

**Implementation details**

- Trigger on a **high-probability EOT** (semantic model says complete) or after a short silence (e.g. 150-300 ms), and run until a longer confirm timeout.
- **Hold back audio:** generate text and even synthesise TTS, but only start playback after confirmation (or if confident).
- **Compare transcripts:** if the final transcript equals the speculative one, reuse the result; otherwise cancel (abort the HTTP stream, free GPU slot).
- Keep speculative calls **side-effect free:** do not execute tools that write/charge; allow read-only tool calls only or defer actions until commit.
- Reuse **prompt caching** so a restart is cheap.

```python
spec = asyncio.create_task(llm_stream(history + [partial]))
if await user_resumed(timeout=0.4):
    spec.cancel()                       # wasted tokens, no user-visible harm
else:
    stream_to_tts(await spec)           # response already in flight
```

**Trade-offs:** saves roughly the confirm window (hundreds of ms) in the common case; wasted LLM calls (extra cost/load, maybe 10-30% more requests), complexity with state and tools; wrong early replies must never be spoken. Measure hit rate, cancellation rate and p50/p95 voice-to-voice improvement.
