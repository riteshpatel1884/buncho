| Stage | Data | Objective | What it gives you |
|---|---|---|---|
| **Pre-training** | Trillions of tokens of raw text/code | Next-token prediction | Knowledge, language, reasoning ability\; a **base model** that continues text |
| **SFT / instruction tuning** | 10k to ~1M curated `(instruction, response)` demonstrations | Next-token loss on responses | Follows instructions, chat format, style\; **imitates** good answers |
| **Preference optimisation (RLHF, DPO, etc.)** | Pairs `(prompt, chosen, rejected)` or reward signals | Raise the probability/reward of preferred behaviour while staying close to the SFT model (KL) | Helpfulness, harmlessness, tone, refusal behaviour\; **optimises** what humans prefer |

**SFT vs alignment training**

- **SFT** learns from **positive examples only**: "do this". It cannot express "this answer is better than that one" or penalise bad answers.
- **Alignment** (RLHF/DPO/RLAIF/Constitutional) uses **comparisons or rewards**, so the model learns relative quality and what to avoid, and can exceed the average demonstrator.
- SFT is usually the **prerequisite**\; preference training refines it. Quality of SFT data largely sets the ceiling ("less but better" data works).

**Modern additions:** continued pre-training on domain text, RL with verifiable rewards (RLVR/GRPO) for reasoning, and distillation/synthetic data throughout.

**Typical recipe:** pre-train, then SFT, then DPO or PPO-style RLHF (plus safety data), evaluate and iterate. Each stage uses a far smaller dataset and far less compute than pre-training.
