**Adversarial testing** evaluates a model on **deliberately crafted or perturbed inputs** designed to cause errors, unsafe output or inconsistent behaviour. It measures **worst-case** robustness rather than average accuracy on a test set.

**Forms**

| Domain | Examples |
|---|---|
| **Classic ML / vision** | Small pixel perturbations that flip a classifier (FGSM, PGD), adversarial patches, physical attacks, data poisoning, backdoors, model extraction, membership inference |
| **NLP** | Typos, synonym swaps, paraphrases, negation, character-level and homoglyph changes, distractor sentences (TextFooler-style attacks) |
| **LLMs** | **Jailbreaks**, prompt injection (direct and indirect), instruction conflicts, encoded or multilingual attacks, many-shot prompts, system-prompt extraction, adversarial suffixes, tool misuse |
| **RAG/agents** | Poisoned documents, malicious tool outputs, retrieval manipulation |
| **Fairness/robustness** | Counterfactual inputs that change only a demographic attribute |

**Process**

1. Define goals and a threat model (what attacker capabilities and what failures matter).
2. Generate attacks: handcrafted, templated, **automated** (mutation, LLM-generated, optimisation-based).
3. Run against the full system and record outcomes with metrics: **attack success rate, robust accuracy** (accuracy under attack), consistency rate under perturbations.
4. Analyse failure clusters and root causes; fix via adversarial training/data augmentation, input sanitising, guardrails, architecture constraints.
5. **Add failures to the regression suite** and retest as the system and attacks evolve.

```python
def robustness(model, items, perturbations):
    base = sum(model(x) == y for x, y in items)
    robust = sum(all(model(p(x)) == y for p in perturbations) for x, y in items)
    return base / len(items), robust / len(items)       # clean accuracy vs robust accuracy
```

**Relation to red teaming:** red teaming is the human-centred, goal-driven practice; adversarial testing is the broader (often automated, metric-driven) technique set. Both feed continuous evaluation.
