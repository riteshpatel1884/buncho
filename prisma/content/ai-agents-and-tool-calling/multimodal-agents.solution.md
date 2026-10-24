**Input handling**

| Input | Options |
|---|---|
| **Images / screenshots** | Pass to a vision-capable model directly; resize and compress (tokens scale with size); crop to relevant regions; extract text with OCR for exact strings |
| **PDFs and documents** | Parse text and tables (layout-aware parser), render pages as images for charts and diagrams, give the model both |
| **Audio / voice** | Speech-to-text (Whisper-style) with timestamps and speaker labels; keep the transcript plus metadata; or use a native audio model for tone and low latency |
| **Video** | Sample frames, transcribe the audio track, and summarise by segment |

**Agent design**

- **Modality tools:** `transcribe_audio`, `describe_image`, `extract_pdf_tables`, `ocr_image` so the agent can choose what it needs; large media stays in storage and is referenced by id, not pasted into context.
- **Context budgeting:** images are expensive; downscale, attach only when necessary, and replace old images with text descriptions after use.
- **Normalise** to a common internal representation (text + references + metadata) so memory, retrieval and logs work.

**Output handling**

- **Text** by default; **structured data** for UI; **images/charts** by generating code (matplotlib, Vega) in a sandbox and returning the file, or by calling an image-generation tool; **speech** via text-to-speech.
- Validate outputs (does the chart match the data? is the file safe?).

```python
def handle_message(msg):
    parts = []
    for att in msg.attachments:
        if att.type == "audio":   parts.append(transcribe(att))
        elif att.type == "image": parts.append(vision_block(resize(att, 1024)))
        elif att.type == "pdf":   parts.append(parse_pdf(att))
    return agent.run(msg.text, parts)
```

**Risks and quality:** prompt injection hidden in images/audio/PDF text, PII in media, transcription and OCR errors (verify critical numbers), cost and latency, accessibility. Evaluate per modality with realistic samples.
