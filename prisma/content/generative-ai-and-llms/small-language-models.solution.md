**Definition:** language models small enough to run cheaply, often on a laptop, phone or single GPU. In practice roughly 0.5B to 10B parameters (examples: Phi, Gemma, Llama 3.2 1B/3B, Qwen small variants, SmolLM).

**How they get good**

- **High-quality, curated or synthetic training data** (textbook-style data in the Phi line).
- **Distillation** from larger teachers, and long over-training on many tokens (see scaling laws).
- **Post-training:** instruction tuning and preference optimisation.
- **Quantisation** (4-bit) to shrink memory further.

**Advantages**

- Low latency and cost per token; high throughput.
- **On-device / offline** use and better privacy (data stays local).
- Easy to **fine-tune** (LoRA) for a narrow domain.
- Lower energy use.

**Limits:** weaker broad world knowledge, long-context reasoning and complex multi-step reasoning; more hallucination without retrieval.

**When to choose**

| Use SLM | Use large model |
|---|---|
| Classification, extraction, routing, simple Q&A | Open-ended reasoning, coding agents, broad knowledge |
| Strict latency/cost, edge devices, privacy | Highest quality needed |
| Narrow domain with fine-tuning data | Few examples, many task types |

**Common pattern:** an SLM handles most traffic; a router escalates hard queries to a large model.
