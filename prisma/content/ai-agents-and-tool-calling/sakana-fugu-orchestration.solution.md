**What it is (per Sakana AI's announcement):** Fugu is a **multi-agent orchestration system exposed as a single model**. You call one OpenAI-compatible endpoint; Fugu decides whether to answer directly or to **delegate to a pool of other LLMs** (including instances of itself), then verifies and merges their work into one answer. Variants include **Fugu** (balanced quality and latency) and **Fugu Ultra** (deeper pool for hard multi-step tasks), with later releases aimed at cost/performance.

**Core idea: a learned orchestrator.** Instead of engineers writing a fixed workflow (router, planner, worker, critic), the orchestrator is **itself a language model trained** to decide:

- **when** to delegate and to which model in the pool,
- **how** to talk to sub-agents (what instruction and context to give them),
- **how** to verify and combine their outputs into one response.

This builds on Sakana's earlier research on evolved/learned coordination of LLMs (the **TRINITY** and **Conductor** papers presented at ICLR 2026).

**Practical properties**

- **Model-agnostic pool:** members are swappable; if a provider is unavailable it can route around it, and specific agents can be excluded for privacy or compliance reasons.
- **Single interface:** callers do not manage prompts, routing or retries across vendors.
- **Complementary strengths:** different models are better at different tasks, so a coordinator can exploit them.

```text
client -> Fugu (orchestrator LM)
            |-- delegate subtask -> model A
            |-- delegate subtask -> model B / Fugu instance
            |-- verify, compare, synthesise -> final answer
```

**Compared with hand-written multi-agent pipelines**

| Hand-written | Fugu-style learned orchestration |
|---|---|
| Fixed roles and routing rules | Delegation decided per task by a trained model |
| Predictable, auditable | Adaptive, but a black box |
| You maintain prompts per vendor | Provider abstracted away |

**Caveats (what to be careful about):** the public material says little about training data, algorithm or size; reported benchmark gains are largely provider-reported, so validate on your own tasks; orchestration adds cost and latency, and data is sent to several providers, so check privacy and governance. For details and numbers, read the technical report rather than relying on summaries.
