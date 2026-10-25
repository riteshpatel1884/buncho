**TTS** converts text to natural-sounding speech.

**Classic pipeline**

1. **Text normalisation + G2P:** expand numbers/abbreviations, convert to phonemes, add prosody features.
2. **Acoustic model:** predict a mel-spectrogram (and duration, pitch, energy) from phonemes/text.
3. **Vocoder:** turn the spectrogram into a waveform.

**Model families**

| Family | Examples | Notes |
|---|---|---|
| Autoregressive acoustic | Tacotron 2 | Natural, slower, can skip/repeat words |
| Non-autoregressive | FastSpeech 2 | Parallel and fast, duration predictor |
| Neural vocoders | WaveNet, WaveGlow, **HiFi-GAN**, Vocos | High-quality real-time waveform generation |
| End-to-end | **VITS** (VAE + flow + GAN) | Text to waveform in one model |
| **Neural codec language models** | VALL-E, Bark, XTTS, Orpheus-style LLM TTS | Predict discrete audio codec tokens (EnCodec/SNAC) with an LLM; zero-shot voice cloning, expressive |
| **Diffusion/flow matching** | StyleTTS 2, NaturalSpeech 3, F5-TTS | High naturalness, voice cloning |
| Commercial | ElevenLabs, OpenAI TTS, Google, Azure, Cartesia | Low-latency streaming APIs |

**Important features:** voice cloning/speaker embeddings, emotion and style control, multilingual and code-switching, SSML, word timestamps, **streaming** (generate audio in chunks while text is still arriving; time-to-first-audio about 100-300 ms), and controllable speed.

**Evaluation:** MOS (human naturalness rating), WER of an ASR on the output (intelligibility), speaker similarity, prosody, latency and real-time factor (RTF below 1).

**Risks:** voice-clone fraud and deepfakes, so require consent, watermarking and detection.
