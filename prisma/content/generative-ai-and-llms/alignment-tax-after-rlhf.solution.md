**Alignment tax:** the capability or helpfulness lost when optimising for safety and preference rewards. Causes: over-optimising a reward model, narrow preference data, over-refusal examples, and drift away from the base model.

**Diagnose:** run capability benchmarks (code, maths, reasoning) and a refusal benchmark (borderline-safe prompts) before and after. Find which stage caused the drop (SFT, reward model, RL).

**Mitigations**

- **Stronger KL regularisation / early stopping** so the policy stays near the base model.
- **Mix in capability data:** include pre-training or task data in the RL/SFT loop (PPO-ptx style) so skills are rehearsed.
- **Balanced preference data:** include prompts where being helpful is the correct behaviour, penalise unnecessary refusals as well as unsafe answers.
- **Better reward models:** separate helpfulness and harmlessness rewards, ensembles, and multi-objective optimisation with explicit weights or constraints.
- **Verifiable rewards** (tests, math answers) for reasoning so capability is rewarded directly.
- **Model merging / interpolation:** blend the aligned and base weights (WiSE-FT style) and pick the best trade-off.
- **Lower learning rate, LoRA** for alignment to limit drift.
- **Evaluate continuously** on both axes and track the safety/capability frontier, not one number.

**Framing:** it is a trade-off curve; the goal is to move the whole frontier outward (better data and rewards), not just slide along it.
