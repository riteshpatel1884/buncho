**Video = frames + time + audio.** The challenge is volume: 1 minute at 30 fps is 1800 frames; at ~500 tokens/frame that is nearly 1M tokens.

**Approaches**

1. **Frame sampling + image VLM:** sample at 0.5-2 fps or **keyframes** (scene-change detection, motion, clustering), tile/resize, feed with timestamps ("t=12.0s") to a VLM. Simple and strong baseline.
2. **Video-native models:** encoders with temporal modelling (VideoMAE, TimeSformer, ViViT, InternVideo, Video-LLaVA, Qwen-VL video, Gemini long context): 3D/space-time patches, token merging across frames, temporal position encodings.
3. **Add audio:** transcribe with Whisper (timestamped), include as text track; sound events if relevant; OCR for on-screen text.
4. **Long videos (minutes to hours):**
   - **Retrieval:** chunk into clips, embed (CLIP/SigLIP, video embeddings, transcript), retrieve relevant segments for the question, then run the VLM only on those.
   - **Hierarchical summarisation:** caption clips, summarise per scene, then per video (map-reduce); store a timeline index.
   - **Agentic search:** the LLM calls tools (get_frames(t1,t2), search_transcript) iteratively.
   - Long-context models with token compression.
5. **Structured perception:** detection/tracking/pose models produce events and counts that an LLM reasons over (surveillance, sports analytics).

```python
frames = sample_frames(video, fps=1, max_frames=32)             # uniform or keyframe based
prompt = [{"t": f"{t:.0f}s", "image": img} for t, img in frames] + [{"text": question}]
answer = vlm(prompt, transcript=asr(video_audio))                # timestamps let the model cite moments
```

**Tasks:** captioning, video QA, temporal grounding ("when does X happen"), action recognition, summarisation, search, moderation, highlight detection, anomaly detection.

**Pitfalls:** temporal reasoning errors (order, counting), missed short events with sparse sampling, hallucinated actions, cost. **Evaluate** with Video-MME, MVBench, EgoSchema, and domain tests; log sampled frames for debugging.
