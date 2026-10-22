```python
import asyncio, requests

async def summarize(text):
    resp = requests.post(URL, json={"text": text}, timeout=30)   # about 2 s per call
    return resp.json()["summary"]

async def main(texts):
    return await asyncio.gather(*(summarize(t) for t in texts))

asyncio.run(main(texts))     # 50 texts take about 100 s
```

The developer expected about 2 seconds. Explain why it takes 100 s, and give two fixes. Which is better and why?
