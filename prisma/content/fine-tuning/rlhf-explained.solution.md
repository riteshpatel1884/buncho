**Why:** "helpful, honest, harmless" is hard to write as a loss function, but humans can easily **say which of two answers is better**.

**Three stages (InstructGPT recipe)**

1. **SFT:** fine-tune the base model on human demonstrations.
2. **Reward model (RM):** humans rank multiple answers per prompt\; train a model $r_\phi(x,y)$ with the **Bradley-Terry** loss
$$\mathcal{L}_{RM}=-\log\sigma\big(r_\phi(x,y_w)-r_\phi(x,y_l)\big)$$
3. **RL (PPO):** optimise the policy $\pi_\theta$ to maximise reward with a **KL penalty** to the SFT/reference model:
$$\max_\theta\;\mathbb{E}\big[r_\phi(x,y)\big]-\beta\,\mathrm{KL}\big(\pi_\theta\,\|\,\pi_{ref}\big)$$

The KL term prevents **reward hacking** and keeps the language fluent.

**Original paper (Christiano et al., 2017, "Deep RL from Human Preferences"):** trained agents on Atari and simulated robotics with **no reward function**, only humans comparing short clips of behaviour (about 1% of interactions needed feedback). A reward model was learned from those comparisons and used to train the agent with RL. This is the template that later work (Ziegler et al., summarisation\; InstructGPT\; ChatGPT) applied to language models.

**Results:** InstructGPT (1.3B) was preferred by humans over the 175B GPT-3 base, showing alignment can matter more than raw scale.

**Problems**

- Expensive, noisy human labels\; annotator disagreement and bias.
- **Reward hacking / over-optimisation:** the policy exploits RM flaws (verbosity, flattery, sycophancy).
- PPO is complex and unstable (four models in memory).
- "Alignment tax" on some capabilities.

**Alternatives:** DPO (no RM/RL), RLAIF and Constitutional AI (AI feedback), RLVR/GRPO (verifiable rewards).
