**RLVR** trains an LLM with RL where the reward comes from a **programmatic verifier** that checks correctness, not from a learned reward model of human preference.

**Examples of verifiers**

- **Maths:** final answer equals the known answer (after normalisation).
- **Code:** unit tests pass, program compiles.
- **Format/structure:** valid JSON, follows required tags, instruction constraints (word count, forbidden words).
- **Puzzles/logic/games:** solved or not.

```python
def reward(sample, gold):
    r_format = 0.1 if re.search(r"<answer>.*</answer>", sample, re.S) else 0.0
    ans = extract_answer(sample)
    r_correct = 1.0 if ans is not None and normalise(ans) == normalise(gold) else 0.0
    return r_correct + r_format
```

**Training loop:** sample several answers per prompt, score each with the verifier, update the policy toward higher-reward samples. **GRPO** is popular here: it normalises rewards within each group of samples, so **no value network or reward model** is needed. DeepSeek-R1 and Tulu 3 popularised RLVR; long chain-of-thought reasoning emerged under such training.

**When it beats a learned RM**

- The task has an **objective, checkable answer** (maths, code, structured output).
- You want to avoid **reward hacking** of a learned model (a rule-based reward has far fewer exploitable quirks).
- Cheaper and simpler than collecting preference data and training an RM; signal is **exact**, not noisy.

**Limits**

- Only works where correctness can be verified; open-ended writing, helpfulness and safety still need preference models.
- **Sparse rewards** (all-wrong or all-right groups give no learning signal); needs a base model that can already solve some problems.
- Verifiers can still be gamed (hard-coding test cases, answer-format tricks); rewards for the final answer alone may not make reasoning faithful.
- Gains may mostly sharpen existing capabilities rather than add new ones.

**In practice:** combine RLVR for reasoning with preference-based training for helpfulness and safety.
