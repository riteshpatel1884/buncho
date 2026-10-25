**Problem:** waiting for the full LLM reply before synthesising speech makes latency = LLM generation time (seconds) + TTS time. 

**Solution:** stream tokens from the LLM, **cut the text at natural boundaries** (sentence end or clause/comma after a minimum length), and send each chunk to TTS immediately. Playback of chunk 1 overlaps with generation of chunk 2, so **time-to-first-audio** is about LLM TTFT + time to first sentence + TTS first-byte, instead of the whole response.

```python
import re

async def speak_stream(llm_tokens, tts):
    buf = ""
    async for tok in llm_tokens:
        buf += tok
        parts = re.split(r"(?<=[.!?])\s+", buf)
        for s in parts[:-1]:                    # all but the trailing, possibly incomplete sentence
            await tts.say(s)                    # synthesise + queue audio immediately
        buf = parts[-1]
    if buf.strip(): await tts.say(buf)
```

**Design choices**

- **First chunk smaller** (a short clause, 4-8 words) to start fast; later chunks longer for better prosody.
- Beware false sentence boundaries ("Dr.", "3.5", "e.g."), URLs, and lists; use a proper splitter or LLM-formatted output with markers.
- Remove markdown/emoji, normalise numbers before TTS.
- **Too small chunks** give choppy intonation and gaps if generation lags (buffer underrun); keep a minimum playback buffer and pre-fetch the next chunk.
- Streaming TTS that accepts incremental text (WebSocket input streaming) removes manual chunking; context carry-over keeps prosody consistent.
- On barge-in, cancel queued chunks and record only what was spoken.
