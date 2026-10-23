| | RAG | Fine-tuning |
|---|---|---|
| What it changes | The **context** given at query time | The **model weights** |
| Best for | **Knowledge**: private, changing, large, citable facts | **Behaviour**: style, format, domain language, task skill, consistency |
| Freshness | Update the index in minutes | Needs retraining |
| Hallucination control | Grounded in sources; can cite | Does not reliably add facts; can still hallucinate |
| Data needed | Documents | Hundreds to thousands of quality examples |
| Cost | Infrastructure + longer prompts per request | Training cost up front; can shorten prompts later |
| Latency | Retrieval and longer context | No retrieval; possibly smaller model |
| Access control | Per-document permissions possible | Knowledge baked in; hard to restrict or delete |
| Explainability | Show sources | Opaque |

**Decision rule**

- Model lacks **facts** or facts **change**, or users need **citations/permissions** -> **RAG**.
- Model has the knowledge but the wrong **format, tone, reasoning pattern or reliability on a narrow task**; or you want a **smaller, cheaper model** to match a larger one -> **fine-tune**.
- First try **prompting**, then RAG, then fine-tuning; each step adds cost.

**Combine them (common in production):** fine-tune for output format, domain terminology and how to use retrieved context (including saying "not in the sources"), and use RAG for the facts. Also, fine-tune the *embedding model* or reranker to improve retrieval.

**Pitfalls:** fine-tuning to inject facts (forgets, hallucinates, goes stale); RAG on a task that really needs a new skill; ignoring evaluation. Decide using a small eval set comparing the options.
