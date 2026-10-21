## Short answer

The **context window** is the maximum number of tokens a model can take into account in a single request. Everything the model "knows" about your task at generation time (instructions, history, documents, tool results and its own output so far) must fit inside it. Sizes range from a few thousand to over a million tokens depending on the model.

## What counts toward it

- System prompt and tool definitions
- Conversation history and any memory or retrieved documents
- The new user message
- The **output** being generated (most APIs also enforce a separate maximum output length)

Models are stateless: a chat feels continuous only because the application resends the history each turn.

## Why it matters

- **Capability boundary:** anything outside the window is invisible to the model.
- **Cost and latency** grow with the number of tokens processed, and attention memory (KV cache) grows with it too.
- **Quality:** a larger window is not used uniformly well. Models often recall information at the start and end of a long prompt better than the middle (the *lost in the middle* effect), and long, noisy context can distract the model.

## What happens when you exceed it

The API returns an error, or the application truncates input, and truncation may silently drop important instructions or the oldest messages.

## Designing around it

Budget tokens explicitly:

$$\text{available for context} = \text{window} - \text{reserved output} - \text{system prompt} - \text{tool definitions}$$

| Technique | Use when |
|---|---|
| Truncate or sliding window | Old turns matter little |
| Summarise or compact history | Long conversations need the gist |
| **RAG** | Large knowledge bases: put in only the relevant chunks |
| Sub-agents or map-reduce | Tasks span more material than one window |
| Prompt / prefix caching | The same long prefix is reused across calls |
| Structured memory outside the prompt | Facts must persist across sessions |

## Interview follow-up

*"If windows are huge, do we still need RAG?"* Usually yes. Retrieval is cheaper and faster per query, makes answers attributable, scales beyond any window, and avoids the quality loss from stuffing irrelevant text into the prompt.
