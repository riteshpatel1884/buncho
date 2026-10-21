## Definition

A **foundation model** is a large model trained on broad, mostly unlabelled data using self-supervision at scale, so that it can be **adapted to a wide range of downstream tasks** (the term comes from Stanford's 2021 report *On the Opportunities and Risks of Foundation Models*). Examples: GPT, Claude, Llama and Gemini for text; CLIP and SigLIP for image-text; Stable Diffusion and Flux for images; Whisper for speech.

Two properties define them:

- **Emergence and homogenisation.** One pre-trained model underlies many applications, and capabilities such as in-context learning and instruction following appear as scale grows rather than being explicitly programmed.
- **Adaptation instead of training from scratch.** You prompt, retrieve, fine-tune or distil from the same base model.

## How the workflow changed

| | Classical ML engineering | AI engineering with foundation models |
|---|---|---|
| Starting point | Collect labelled data per task | Start from a pre-trained model, often via API |
| Main effort | Feature engineering, model training | Prompting, retrieval, evaluation, adaptation |
| Time to first prototype | Weeks to months | Hours to days |
| Cost profile | Training cost dominates | Inference cost and latency dominate |
| Output | Fixed label or number | Open-ended text, code, images (hard to score) |
| Typical failures | Wrong prediction, drift | Hallucination, prompt injection, inconsistency |

## What AI engineers do now

1. **Choose and adapt a model:** prompt engineering first, then RAG for knowledge, then fine-tuning (LoRA/QLoRA) for behaviour or style, then distillation for cost.
2. **Build the system around the model:** retrieval pipelines, tool use and agents, guardrails, caching, routing between models.
3. **Evaluate rigorously:** golden datasets, LLM-as-a-judge, regression suites, online A/B tests. Evaluation is the bottleneck because outputs are open-ended.
4. **Operate it:** latency (time to first token), throughput, cost per request, observability, versioning of prompts and models.

## Trade-offs and caveats

- Building on a closed API gives speed but creates vendor dependence, data-privacy questions and exposure to silent model updates.
- Self-hosting open weights gives control and lower unit cost at scale, but needs GPU and serving expertise.
- Foundation models inherit biases and errors from their training data, so safety, evaluation and monitoring are part of the job, not an afterthought.

**One-line summary:** the centre of gravity moved from *training a model per task* to *adapting, orchestrating, evaluating and serving a shared pre-trained model*.
