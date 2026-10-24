**Constitutional AI (CAI; Bai et al., Anthropic, 2022)** trains a harmless, helpful assistant using a written set of **principles (a "constitution")** and **AI-generated feedback**, rather than human labels of harmful outputs.

**Stage 1: supervised (critique and revision)**

1. Sample a response to a (possibly red-team) prompt from a helpful model, which may be harmful.
2. Ask the model to **critique** its response against a randomly chosen principle.
3. Ask it to **revise** the response accordingly (can repeat).
4. **SFT** on the revised responses.

**Stage 2: RL from AI feedback (RLAIF)**

1. For each prompt, sample **two responses** from the SFT model.
2. A model chooses which response better follows the constitution (AI preference labels for harmlessness; human labels still used for helpfulness in the original work).
3. Train a **preference model** on these labels.
4. Optimise the policy with **RL** against the preference model.

```text
principle: "Choose the response that is least likely to help someone cause harm, while still being helpful."
prompt -> responseA / responseB -> judge picks per principle -> preference data -> RM / DPO -> policy
```

**Differences from classic RLHF**

| | RLHF | Constitutional AI |
|---|---|---|
| Harmlessness labels | Humans compare outputs (including exposure to harmful content) | AI applies written principles |
| Transparency | Values implicit in labeller behaviour | **Explicit, auditable rules** |
| Scalability | Limited by annotators | Scales with compute |
| Behaviour | Tends to be **evasive** on harmful requests | Aims for **non-evasive**: explains objections while staying helpful |

**Limits:** results depend on the quality and coverage of the principles and on the labeller's judgement; AI feedback inherits model bias; principles can conflict and need careful drafting; it still needs evaluation by humans and red-teaming.
