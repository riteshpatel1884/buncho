## Terminology first

- **Closed (proprietary) models** are accessed only through an **API or product**. You cannot see or download the weights. Examples: the GPT, Claude and Gemini model families.
- **Open-weight models** publish the trained **weights** so you can download, run and fine-tune them yourself. Examples: Llama, Mistral, Qwen, DeepSeek, Gemma.
- **Truly open-source** in the OSI sense would also mean open training code and data and a permissive licence. Most "open" LLMs are **open-weight with a custom licence** (some restrict commercial use, large-scale deployment or certain uses) and **do not release training data**. Always read the licence.

## Trade-offs

| Factor | Closed API | Open-weight, self-hosted |
|---|---|---|
| **Peak capability** | Usually the strongest frontier models | Often close behind, strong for many tasks, gap varies by task |
| **Time to start** | Minutes | Needs GPUs and serving stack (vLLM, TGI, llama.cpp) |
| **Cost at low volume** | Cheap, pay per token | Idle GPUs are expensive |
| **Cost at high, steady volume** | Can become very expensive | Usually cheaper per token at scale |
| **Data privacy and residency** | Data leaves your boundary (contractual protections) | Data never leaves your infrastructure |
| **Customisation** | Prompting, limited fine-tuning | Full fine-tuning, LoRA, distillation, quantisation, custom decoding |
| **Control and stability** | Provider may update or deprecate models | You pin exact weights, reproducible behaviour |
| **Latency control** | Shared infrastructure | You tune hardware and batching |
| **Operations burden** | Provider handles scaling and safety | You handle scaling, monitoring, upgrades, security |
| **Safety tooling** | Built-in moderation and policies | You add your own guardrails |
| **Vendor lock-in** | Higher | Lower |
| **Offline / edge use** | Not possible | Possible with small quantised models |

## How to decide

Choose **closed** when you need the best quality quickly, volume is low or spiky, you lack ML infrastructure, or the task is complex reasoning or coding where frontier models clearly lead.

Choose **open-weight** when you have strict privacy, compliance or data-residency requirements, high and predictable volume, need deep fine-tuning or on-device deployment, or must avoid dependence on one vendor.

A good process:

1. Prototype on a strong closed model to learn what is possible.
2. Build an **evaluation set** from your real tasks.
3. Test open candidates on the same set, including smaller and quantised ones.
4. Compare **total cost** (GPUs, engineers, utilisation) and not just per-token price.
5. Re-check periodically as models improve.

## Hybrid patterns

Route easy, high-volume requests to a cheap open or small model and hard ones to a frontier API; use an LLM gateway so providers can be swapped; distil a closed model's behaviour into a smaller open one (after checking the provider's terms of service).

## Caveats

- "Open" does not mean safe or free of bias; you own the safety work.
- Closed providers' data policies, retention and training-use terms differ; verify them.
- Benchmarks do not substitute for testing on your own data.
