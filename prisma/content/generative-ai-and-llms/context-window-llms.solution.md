## Definition

The **context window** is the maximum number of **tokens** the model can take into account in a single request. It covers **everything**: system prompt, tool definitions, conversation history, retrieved documents, the user's message **and** the tokens the model generates (**input + output $\le$ window**).

The model is **stateless**. It has no memory beyond what is placed in the window, so "remembering" a conversation means the application re-sends it each turn.

## Why it matters

- **Capability:** it limits how much a model can read at once (a long contract, a codebase, many search results).
- **Cost and latency:** you pay per token, and longer inputs mean a slower **prefill** and more **KV-cache** memory.
- **Quality:** advertised length is not the same as **effective** length. Accuracy often drops for information buried in the middle of a long prompt (**lost in the middle**), and with distracting irrelevant content.
- **Behaviour at the limit:** the API errors out or the application truncates, silently dropping the oldest or most distant text, which can remove instructions.

## Practical numbers

Rough rule for English: 1 token is about 0.75 word. Window sizes range from a few thousand tokens in older models to hundreds of thousands or millions in recent ones, but each model's limit is specific and should be checked.

## How to work within it

| Technique | Use |
|---|---|
| **Truncation / sliding window** | Keep the most recent turns |
| **Summarisation / compaction** | Replace old turns with a summary |
| **RAG** | Retrieve only the relevant chunks instead of whole documents |
| **Chunking and map-reduce** | Process large documents in pieces, then combine |
| **Prompt caching** | Reuse a long, repeated prefix cheaply |
| **Place key content at the start or end** | Mitigates lost-in-the-middle |
| **Token budgeting** | Reserve output tokens and count inputs before calling |

## RAG vs long context

Long context is simplest for one-off analysis of a few documents. RAG wins when the corpus is large, changes often, needs permissions and citations, or when cost per query matters. They are often combined.

## Interview pitfalls

- Forgetting that **output tokens share the window**.
- Assuming a bigger window means the model uses all of it well.
- Treating the window as long-term memory; durable memory needs external storage.
