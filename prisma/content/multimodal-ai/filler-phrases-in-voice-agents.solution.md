**Filler phrases** are short utterances ("Let me check that for you...", "One moment, pulling up your order", "Hmm, let me see") spoken **while a slow step runs** (tool call, database lookup, RAG, long LLM reasoning). They do not reduce actual latency but remove **perceived** dead air, which on phone calls makes users repeat themselves, hang up, or think the line dropped.

**Implementation**

1. **Trigger:** the LLM decides to call a tool, or the pipeline measures that no audio has been produced after ~700-1000 ms.
2. **Speak immediately** from pre-synthesised audio (cached clips, so zero TTS latency) or have the LLM emit a filler sentence *before* the tool call in the same response (prompt: "say a brief acknowledgement before calling tools").
3. **Run the tool in parallel**; when it returns, continue the answer. If it takes long, add another filler or a status update (e.g. every 3 to 4 s), and offer a fallback ("this is taking a bit, shall I call you back?").
4. **Interruptible:** treat fillers as normal agent speech that can be barged in.

```python
async def call_with_filler(tool, args, say):
    task = asyncio.create_task(tool(**args))
    try:
        return await asyncio.wait_for(asyncio.shield(task), 0.8)
    except asyncio.TimeoutError:
        await say(random.choice(FILLERS))       # cached audio, no synthesis delay
        return await task
```

**Guidelines:** vary phrases (avoid robotic repetition), match tone/brand, keep them short and context-specific ("checking your appointment"), do not promise outcomes before results ("I found it" prematurely), skip them when the response is already fast (they add noise), and make sure they are logged separately from the conversation facts. Pair with streaming results and background music/tones in some phone systems.
