**Goal:** improve a policy `pi_theta` using sampled trajectories without taking steps so large that training collapses.

**Probability ratio:** `r_t = pi_theta(a_t | s_t) / pi_old(a_t | s_t)`

**Clipped surrogate objective**

`L = E[ min( r_t * A_t,  clip(r_t, 1 - eps, 1 + eps) * A_t ) ]`

- `A_t` is the **advantage**: how much better the action was than expected, estimated with a **value network** (critic) and GAE.
- Clipping removes the incentive to move the ratio outside `[1 - eps, 1 + eps]` (`eps` about 0.2), giving a trust-region-like effect with only first-order optimisation.

```python
ratio = (logp_new - logp_old).exp()
unclipped = ratio * adv
clipped = ratio.clamp(1 - eps, 1 + eps) * adv
policy_loss = -torch.min(unclipped, clipped).mean()
value_loss = 0.5 * (values - returns).pow(2).mean()
loss = policy_loss + 0.5 * value_loss - 0.01 * entropy
```

**In RLHF**

- State = prompt plus tokens so far; action = next token; reward given at the end by the reward model.
- Per-token reward includes `- beta * KL(pi_theta || pi_ref)` to prevent drift and reward hacking.
- Four models are live: policy, reference, reward model and value model, which makes it memory-heavy.

**Pros:** stable relative to vanilla policy gradients, flexible. **Cons:** complex, many hyperparameters, expensive; the critic is hard to learn for long text, which motivated critic-free methods like GRPO.
