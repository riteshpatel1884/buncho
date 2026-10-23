**Idea:** PPO needs a value network (critic) the size of the policy to compute advantages. GRPO removes it by using other samples for the **same prompt** as the baseline.

**Algorithm (per prompt `q`)**

1. Sample a **group** of `G` answers `o_1..o_G` from the old policy.
2. Score each with a reward `r_i` (often a rule-based verifier: answer correct, code passes tests, format valid).
3. Compute the **group-relative advantage**: `A_i = (r_i - mean(r)) / std(r)`. Every token of answer `i` gets the same advantage.
4. Update with the PPO-style clipped objective plus a KL term to the reference model.

```python
import torch
def grpo_advantages(rewards):                # rewards: [G]
    return (rewards - rewards.mean()) / (rewards.std() + 1e-6)

# loss = -min(ratio * A, clip(ratio, 1-eps, 1+eps) * A) + beta * KL(pi || pi_ref)
```

**Intuition:** an answer is reinforced if it is better than its siblings, penalised if worse. If all answers get the same reward (all right or all wrong) the advantage is zero and there is no learning signal.

**Benefits:** no critic (about half the memory), simple, works very well with verifiable rewards for maths and code.

**Limitations:** needs many samples per prompt (expensive rollouts); sparse binary rewards waste easy or impossible prompts; length and std-normalisation biases (addressed by variants such as Dr. GRPO and DAPO); less useful when rewards are subjective.
