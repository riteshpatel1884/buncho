**Consuming a stream (OpenAI-style)**

```python
from openai import OpenAI
client = OpenAI()

def stream_answer(prompt):
    stream = client.chat.completions.create(
        model="gpt-4o-mini", stream=True,
        messages=[{"role": "user", "content": prompt}])
    for event in stream:
        delta = event.choices[0].delta.content if event.choices else None
        if delta:
            yield delta                                   # one token or piece at a time
```

**Robust SSE parser (works on raw bytes from any HTTP client)**

```python
import json

class SSEParser:
    def __init__(self):
        self.buf = ""

    def feed(self, chunk: bytes):
        self.buf += chunk.decode("utf-8", errors="ignore")   # see note on split UTF-8
        self.buf = self.buf.replace("\r\n", "\n")
        events = []
        while "\n\n" in self.buf:                            # an event ends at a blank line
            raw, self.buf = self.buf.split("\n\n", 1)
            data_lines = [l[5:].lstrip() for l in raw.split("\n") if l.startswith("data:")]
            if not data_lines:
                continue                                      # comment/keep-alive
            data = "\n".join(data_lines)
            if data == "[DONE]":
                events.append(None)                           # end sentinel
            else:
                events.append(json.loads(data))
        return events

p = SSEParser()
# Works even when the stream is cut anywhere:
print(p.feed(b'data: {"t": "He'), p.feed(b'llo"}\n\ndata: [DONE]\n\n'))
# [] then [{'t': 'Hello'}, None]
```

**Note:** a multi-byte UTF-8 character can be split across chunks; use `codecs.getincrementaldecoder("utf-8")()` instead of per-chunk `decode` in production.

**Serving it to a browser (FastAPI)**

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
app = FastAPI()

@app.get("/chat")
def chat(q: str):
    def gen():
        for piece in stream_answer(q):
            yield f"data: {piece}\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(gen(), media_type="text/event-stream")
```

**Why stream:** time-to-first-token drops from "whole answer" to a few hundred ms, which feels far faster. **Handle:** client disconnects (cancel the upstream call), mid-stream errors, buffering by proxies (disable), and retries (a stream cannot be resumed safely; restart or continue from the partial text).
