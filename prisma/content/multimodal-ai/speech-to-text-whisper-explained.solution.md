**Whisper (OpenAI, 2022)** is an **encoder-decoder Transformer** for multilingual speech recognition, translation and language ID, trained on **680k hours** of weakly supervised web audio (later versions use more).

**Pipeline**

1. **Audio preprocessing:** resample to 16 kHz, pad/trim to **30-second windows**, compute an **80-channel log-Mel spectrogram** (128 in large-v3).
2. **Encoder:** two conv layers then Transformer layers, giving audio representations (about 1500 frames per window).
3. **Decoder:** autoregressive Transformer with cross-attention to the encoder, started by **special tokens** that act as a multitask format:

```text
<|startoftranscript|><|en|><|transcribe|><|notimestamps|> text tokens ... <|endoftext|>
```

Tokens select language, **transcribe vs translate** (to English), and with/without **timestamps**.
4. **Decoding:** greedy or beam search with temperature fallback; compression-ratio and log-probability thresholds to detect failures; optional voice-activity detection.

**Long audio:** sliding windows with previous text as context (can propagate errors). Faster-whisper/CTranslate2, whisper.cpp, batched inference, distil-whisper, and **WhisperX** (VAD + forced alignment + diarisation) improve speed and word timestamps.

```python
from faster_whisper import WhisperModel
model = WhisperModel("large-v3", compute_type="float16")
segments, info = model.transcribe("call.wav", vad_filter=True, word_timestamps=True)
for s in segments: print(f"[{s.start:.1f}-{s.end:.1f}] {s.text}")
```

**Limitations:** **hallucinated text on silence/noise**, repeated loops, no native streaming (windowed; needs chunking tricks), no speaker diarisation, domain jargon errors (fix with prompts/vocabulary biasing or fine-tuning), non-uniform quality across low-resource languages.

**Metrics:** WER/CER; for production also RTF, latency and robustness to accents and noise. Alternatives for streaming ASR: Deepgram, Google/Azure streaming, NVIDIA Parakeet/Canary, conformer-transducer models.
