**RLHF pipeline:** (1) supervised fine-tuning on demonstrations; (2) collect human preferences between pairs of answers and train a **reward model**; (3) optimise the policy against the reward with RL while a **KL penalty** keeps it near the SFT model.

| | PPO | DPO | GRPO |
|---|---|---|---|
| Signal | Reward model (or verifier) | Preference pairs `(chosen, rejected)` | Reward per sample (usually verifiable) |
| Online sampling | Yes | No (offline) | Yes |
| Models in memory | Policy, reference, reward, **value (critic)** | Policy, reference | Policy, reference, reward/verifier (**no critic**) |
| Advantage | From critic (GAE) | None | Group-normalised reward |
| Complexity | High, unstable | Low | Medium |
| Best for | General RLHF | Cheap preference alignment/style | Reasoning with verifiable rewards |
| Weaknesses | Memory, tuning, reward hacking | Offline data limits, can over-optimise | Needs several samples per prompt, long-sequence variance |

**Rule of thumb:** DPO when you have preference data and want simplicity; PPO for flexible online RL with learned rewards; GRPO for maths/code reasoning where answers can be checked automatically.

See the dedicated questions on each method for formulas.
