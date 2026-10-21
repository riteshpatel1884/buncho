## Short answer

A **foundation model** is a large model pretrained on broad data at scale, usually with self-supervised learning, so it can be adapted to many downstream tasks instead of being built for one. The term comes from the 2021 Stanford report *On the Opportunities and Risks of Foundation Models*. GPT, Claude, Llama, Gemini and CLIP are typical examples.

## What changed in AI engineering

| Before | With foundation models |
|---|---|
| One model per task: collect labels, train, tune, deploy | One general model adapted to many tasks |
| Value came from training a model | Value comes from the **system around** the model: context, tools, evaluation |
| Needed labelled data and ML expertise to start | A working prototype needs a prompt and an API key |
| Accuracy measured on a fixed test set | Quality is open-ended, so evaluation becomes its own engineering problem |

The adaptation ladder, from cheapest to most expensive:

1. **Prompting**: instructions and examples in the context window.
2. **RAG**: retrieve private or fresh knowledge and put it in the prompt.
3. **Tool use / agents**: let the model call APIs and take actions.
4. **Fine-tuning** (often LoRA): change behaviour, format or style using your own examples.
5. **Pre-training or continued pre-training**: rarely justified outside a few organisations.

Day-to-day work shifts toward building retrieval pipelines, writing and versioning prompts, designing evals, controlling cost and latency per request, adding guardrails, and monitoring non-deterministic behaviour in production.

## Trade-offs and risks

- **Benefit:** a much faster path to a first prototype, and one model covers many tasks.
- **Risks:** hallucination, vendor dependence (a provider update can silently change your behaviour), cost that scales with tokens, prompt injection, and *homogenisation*: a flaw or bias in a shared model propagates to every product built on it.

## Interview follow-up

*"When would you still train a task-specific model?"* When latency, cost, privacy or on-device constraints rule out a large model, or when a small supervised model already reaches the accuracy target cheaply.
