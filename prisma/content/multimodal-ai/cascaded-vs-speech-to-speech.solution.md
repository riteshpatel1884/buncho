| Dimension | **Cascaded (ASR → LLM → TTS)** | **Native speech-to-speech (S2S)** |
|---|---|---|
| How it works | Separate models: streaming ASR, text LLM, TTS | One model takes audio in, emits audio (and text) out (GPT-4o Realtime, Gemini Live, Moshi, Qwen-Omni) |
| **Latency** | Sum of stages; typically 800-1500 ms with optimisation | Lower, often 300-700 ms; natural overlap and interruption |
| **Paralinguistics** | Lost: tone, emotion, hesitation, laughter, accents mostly stripped by ASR | Preserved on input and can be **expressed on output** |
| **Turn-taking/barge-in** | Engineered (VAD, EOT models) | Learned and more natural (full duplex in some) |
| **Control and debugging** | High: inspect transcript, swap components, custom vocabulary, deterministic guardrails on text | Lower: opaque, harder to inspect and constrain |
| **Reasoning/tool use** | Best-in-class text LLMs and mature tool calling | Improving, sometimes weaker reasoning or tool reliability than top text models |
| **Voice/brand** | Any TTS/clone | Limited to provider voices |
| **Languages/domain terms** | Specialist ASR, custom vocabulary | Depends on model |
| **Cost** | Cheaper per minute with small components; can mix providers | Audio tokens are pricier (provider dependent) |
| **Compliance/logging** | Easy text logs, PII redaction before LLM | Audio-native; need transcription side-channel; harder redaction |
| **Failure modes** | Error compounding (ASR mistakes), robotic cadence | Hallucinated audio, voice drift, safety gaps |

**Hybrids:** S2S front-end with tool calls through text, or cascaded with an **audio-aware LLM** (audio input to LLM, TTS output), or realtime S2S for chit-chat and cascaded for regulated flows.

**Decision rule:** pick **S2S** when conversational feel, emotion and lowest latency matter (companions, tutoring, consumer assistants). Pick **cascaded** when you need strict control, auditability, specialised vocabulary, top reasoning/tools, redaction, or cost optimisation (contact centres, healthcare, finance). Prototype both and measure task success, voice-to-voice latency, and cost per minute on real calls.
