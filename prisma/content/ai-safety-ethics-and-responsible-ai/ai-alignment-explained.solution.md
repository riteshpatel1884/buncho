**Alignment** is making AI systems pursue the goals and values their designers and users **actually intend**: helpful, honest, harmless (HHH), and robust to misuse.

**Why it is hard**

- **Specification problem (outer alignment):** objectives are proxies. Optimising a proxy hard leads to **reward hacking / Goodhart's law** (engagement-maximising recommenders, sycophantic chatbots).
- **Generalisation problem (inner alignment):** a model may learn behaviour that scores well in training but differs in new situations (goal misgeneralisation, deceptive behaviour in theory).
- **Value pluralism:** whose preferences? Cultures, users, operators and society conflict.
- **Scalable oversight:** humans struggle to judge outputs of systems more capable than themselves.

**Techniques**

- Instruction tuning, **RLHF / DPO / RLAIF**, **Constitutional AI** (principles guide critique and revision).
- Red teaming, adversarial training, safety evals, system-level guardrails.
- Interpretability and monitoring, scalable oversight (debate, AI-assisted review), refusal and uncertainty training.

**Why it matters to engineers**

- Misaligned behaviour is a product failure: harmful advice, sycophancy, manipulation, unsafe tool use, legal exposure and lost trust.
- Capability growth (agents with tools and autonomy) increases the **cost of misalignment**.
- Trade-offs are real: over-refusal harms usefulness (**alignment tax**); define policies explicitly and test them.

**Practical stance:** treat alignment as layered: model training + policy + guardrails + monitoring + human oversight, and measure it continuously.
