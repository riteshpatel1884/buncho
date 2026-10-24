**RLAIF** replaces (or supplements) **human preference labellers** with an **AI model** that judges which of two responses is better. The rest of the RLHF pipeline (reward model or direct preference optimisation, then RL) is unchanged.

**Pipeline**

1. Sample two or more responses per prompt from the policy.
2. Ask a strong **labeller LLM** with a rubric (or a list of principles) which response is better, ideally with reasoning and with the order randomised.
3. Train a reward model on those AI labels, or use them directly in **DPO**; optionally **distil** the labeller into the RM.
4. Optimise the policy with RL/DPO.

```python
def ai_preference(judge, prompt, a, b):
    verdict = judge(f"Prompt: {prompt}\n\nA: {a}\n\nB: {b}\n\nFollowing the helpfulness and "
                    "harmlessness guidelines, which is better? Think step by step, then answer A or B.")
    return verdict                      # run both orders (A,B) and (B,A) and keep consistent results only
```

| | RLHF | RLAIF |
|---|---|---|
| Labeller | Humans | AI model |
| Cost / speed | Slow and expensive | Cheap, fast, scalable |
| Consistency | Annotator disagreement | Consistent but systematic bias |
| Best at | Subtle values, novel domains, ground truth | Large-scale coverage, well-defined criteria |

**Evidence:** Google's study (Lee et al., 2023) found RLAIF **comparable to RLHF** on summarisation and helpfulness tasks, and "direct" RLAIF (using the LLM's scores as the reward) also worked.

**Risks:** the labeller's biases (verbosity, position, self-preference) get amplified; errors are **correlated** rather than averaged away; feedback loops if the same model family labels and is trained; weaker on subtle cultural or safety judgements. **Mitigate** with mixed human/AI labels, human audits of a sample, a different or stronger labeller, and rubric-based prompts. **Constitutional AI** is a notable RLAIF-style method for harmlessness.
