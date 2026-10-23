**Definition:** a system that improves its own capabilities (its code, training data, algorithms or the process that produces its successors), where each improvement makes the next one easier. The loop is *recursive* if gains compound.

**Forms, from established to speculative**

- **Self-generated training data** (current practice): a model generates, filters and verifies data (rejection sampling, self-play, verifiable-reward RL) and trains on it, improving its reasoning and coding.
- **Self-critique and revision** (Constitutional AI, self-refine): improve outputs or feedback using the model itself.
- **AI doing AI research and engineering:** models writing and optimising kernels, training code, architectures and evals, speeding up human labs.
- **Self-modifying agents:** agents that edit their own scaffolding or code and keep changes that benchmark better.
- **Fully autonomous RSI** (hypothetical): a system improving its own core model and driving rapid, compounding capability growth ("intelligence explosion").

**Limits and open questions**

- Improvements need a reliable **verifier**; without one, models amplify their own errors (model collapse, reward hacking).
- Diminishing returns, compute and data bottlenecks, and the need for real-world experiments.
- Whether gains compound or plateau is empirically unknown.

**Risks and governance:** faster capability gain than oversight, loss of interpretability, misaligned goals being amplified. Responses include human-in-the-loop checkpoints, sandboxed evaluation, capability thresholds, and monitoring AI-driven R&D.

**Interview framing:** distinguish today's narrow, verifier-bound self-improvement from the speculative open-ended version.
