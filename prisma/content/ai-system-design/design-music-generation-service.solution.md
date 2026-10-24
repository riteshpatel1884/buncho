**Requirements:** minutes-long audio, lyrics + style prompts, extend/remix, generation in under a minute or two, streaming preview, licensing and abuse controls.

**Architecture**

```text
Client -> API -> Auth, credits, rate limits
   -> Input safety (prompt/lyrics policy, artist-name and copyright filters)
   -> Lyric/structure planner (LLM: verses, chorus, tags, tempo/key)
   -> Job queue -> GPU workers:
        Generator (audio codec tokens via autoregressive/diffusion model; text + lyric conditioning)
        -> Codec decoder (e.g. neural codec/vocoder) -> mastering (loudness, EQ)
   -> Output checks (content ID/fingerprint match vs copyrighted catalogue, safety) + watermark
   -> Object store/CDN (stream via HLS) -> Library, sharing, stems/export
```

**Design decisions**

- **Audio is long and high-rate:** use a **neural audio codec** to compress audio into discrete tokens/latents, so the model works on a manageable sequence length; hierarchical generation (coarse structure then detail).
- **Long-form coherence:** generate in segments with overlap and continuation conditioning; allow "extend" using the previous tokens.
- **Alignment of vocals and lyrics:** conditioning on lyric tokens, forced-alignment checks, quality classifiers to reject garbled vocals.
- **Streaming preview:** play the first segment while the rest generates; progressive upload.
- **Throughput:** batch by duration, distilled/fast samplers, GPU pool autoscaling with queue-based priority.
- **Rights and safety:** training-data licensing, blocking requests to imitate named artists or reproduce copyrighted lyrics, **audio fingerprinting** against catalogues, watermarking/provenance, takedown workflow, voice-cloning consent controls.
- **Storage:** original + compressed versions, stems if supported, metadata with prompt, seed, model version.

**Evaluation:** human listening tests (MOS), prompt adherence, lyric intelligibility (ASR word error rate on vocals), diversity, duplication/similarity checks vs training data.

**Metrics:** generation latency, cost per song, rejection rate, copyright match rate, user retention.
