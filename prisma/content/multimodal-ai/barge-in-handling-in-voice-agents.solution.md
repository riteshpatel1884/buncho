**Barge-in** = the user speaks while the agent is talking. A good agent stops quickly and continues naturally from what the user said.

**Sequence**

1. **Detect:** VAD on the **echo-cancelled** microphone stream (acoustic echo cancellation, AEC, is essential; otherwise the agent hears itself). Require a minimum speech duration (e.g. 150-300 ms) or a few recognised words to ignore coughs and "uh-huh".
2. **Stop output immediately:** cancel the TTS stream, **flush audio buffers** on the server and in the client/telephony leg (clear queued RTP/WebRTC packets), and abort the in-flight LLM generation.
3. **Truncate the conversation context** to what the user actually **heard**: use TTS word timestamps / played-audio position to cut the assistant message at the interruption point (mark it "[interrupted]"), otherwise the LLM believes it said things the user never heard.
4. **Process the new user speech** as the next turn (streaming ASR continues; use turn-taking logic to know when they finish).
5. **Resume policy:** answer the new input; optionally offer to continue the earlier answer if the user only backchanneled.

**Edge cases**

- **Backchannels** ("mm-hmm", "right") should not stop the agent: classify short non-lexical acknowledgements or use word-count/duration thresholds.
- **Noise, TV, other speakers:** speaker verification or higher thresholds; push-to-talk for noisy settings.
- **Echo/feedback loops:** AEC, headset recommendations, ducking agent volume on suspected speech.
- **Tool calls in progress:** make actions idempotent and decide whether to cancel or finish them.
- **Telephony latency:** buffered audio on the carrier side may continue playing, so clear marks/queues via provider APIs.

**Metrics:** time from user onset to agent silence (target under 300 ms), false-interrupt rate, missed-interrupt rate, and context correctness after interruptions.
