```python
import tiktoken

ENC = tiktoken.get_encoding("o200k_base")          # pick the encoding that matches your model

def count_tokens(text: str) -> int:
    return len(ENC.encode(text))

def count_messages(messages, per_message_overhead=4):
    # chat formats add a few tokens per message for role/separators (check provider docs)
    return sum(count_tokens(m["content"]) + per_message_overhead for m in messages) + 2

def fit_messages(messages, context_window=128_000, max_output=2_000, safety=500):
    budget = context_window - max_output - safety
    system = [m for m in messages if m["role"] == "system"]
    rest = [m for m in messages if m["role"] != "system"]
    last = rest[-1:]                                   # latest user message is mandatory
    history = rest[:-1]

    used = count_messages(system + last)
    if used > budget:
        raise ValueError("system prompt + latest message exceed the context window")

    kept = []
    for m in reversed(history):                        # newest first
        cost = count_tokens(m["content"]) + 4
        if used + cost > budget:
            break
        kept.append(m); used += cost
    return system + list(reversed(kept)) + last

def truncate_to_tokens(text, max_tokens):
    ids = ENC.encode(text)
    return text if len(ids) <= max_tokens else ENC.decode(ids[:max_tokens])
```

**Notes**

- Use the **model's own tokenizer** (tiktoken for OpenAI; provider token-count endpoints or tokenizers for others); estimates like `chars/4` can be off by a lot, especially for code and non-English text.
- Budget = window - **reserved output tokens** - safety margin; the window includes both input and output.
- Never drop the **system prompt** or the **current question**; drop or summarise old turns first. For RAG, trim the lowest-ranked chunks rather than cutting mid-chunk.
- Better than plain dropping: **summarise** older turns, or retrieve relevant past turns.
- Track **cost** from the same counts: tokens x price, and log them per request.
- Tool schemas, images and cached prefixes also consume tokens; include them in the count.
