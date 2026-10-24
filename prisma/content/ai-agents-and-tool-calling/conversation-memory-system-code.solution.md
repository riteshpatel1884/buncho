```python
class BufferMemory:                                    # keeps everything
    def __init__(self): self.msgs = []
    def add(self, role, text): self.msgs.append({"role": role, "content": text})
    def get(self): return list(self.msgs)

class WindowMemory(BufferMemory):                      # last N messages only
    def __init__(self, max_messages=10):
        super().__init__(); self.n = max_messages
    def get(self): return self.msgs[-self.n:]

class SummaryMemory:                                   # rolling summary + recent turns
    def __init__(self, llm, keep_last=6, max_messages=16):
        self.llm, self.keep, self.max = llm, keep_last, max_messages
        self.summary, self.msgs = "", []

    def add(self, role, text):
        self.msgs.append({"role": role, "content": text})
        if len(self.msgs) > self.max:
            old, self.msgs = self.msgs[:-self.keep], self.msgs[-self.keep:]
            transcript = "\n".join(f"{m['role']}: {m['content']}" for m in old)
            self.summary = self.llm(
                "Update the summary with the new messages. Keep names, numbers, "
                "decisions and open questions.\n\n"
                f"Current summary:\n{self.summary}\n\nNew messages:\n{transcript}")

    def get(self):
        head = [{"role": "system", "content": f"Conversation summary:\n{self.summary}"}] if self.summary else []
        return head + self.msgs

# usage
# mem.add("user", text); reply = llm(mem.get()); mem.add("assistant", reply)
```

| Strategy | Pros | Cons |
|---|---|---|
| **Buffer** | Perfect recall, simplest | Grows without bound; hits context limit and cost |
| **Sliding window** | Constant cost | Forgets everything older, including key facts |
| **Summary** | Keeps the gist cheaply | Extra LLM call; details can be lost or distorted |
| **Hybrid (summary + window)** | Good balance | More moving parts |

**Beyond this:** store **durable facts** (user preferences) in a separate long-term store, retrieve past turns by **semantic search** when relevant, trim by **token count** not message count, and never summarise away system instructions.
