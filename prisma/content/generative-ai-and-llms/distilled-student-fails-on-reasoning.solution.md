**Diagnose**

- Slice the eval set by difficulty and number of reasoning steps; find where the gap opens.
- Check whether the student was trained on **final answers only**. If so, it never saw the intermediate reasoning.
- Compare capacity limits (a 7B model has less room) versus data limits (too few hard examples).

**Fixes**

1. **Distil the reasoning trace, not just the answer:** have the teacher generate step-by-step chain-of-thought and train on `question -> reasoning -> answer`.
2. **Increase hard-example coverage:** generate more difficult problems; filter teacher outputs by correctness (verify with tests, answer keys or majority vote, i.e. rejection sampling).
3. **On-policy distillation:** let the student generate, have the teacher score or correct, and train on that, so the student learns from its own mistake distribution.
4. **Logit distillation** where tokenizers match, for richer signals.
5. **Curriculum:** easy to hard.
6. **RL after distillation** (GRPO with verifiable rewards) to improve beyond imitation.
7. **Use test-time compute:** sampling several answers with majority vote or a verifier, or route hard queries to the teacher.
8. **Raise capacity** if still stuck: larger student or MoE.

**Expectation:** students usually do not fully reach the teacher on hard reasoning. Decide whether a router that sends only hard cases to the large model is cheaper than closing the whole gap.
