**Idea (metamorphic testing):** when ground truth is hard to get, test **relations** between inputs and outputs. If input $x$ is transformed to $x'$ by a change that should not alter the correct answer (invariance), outputs should stay equivalent; if the change should alter it (directional), the output should change in the expected way.

**Perturbation families**

| Category | Examples | Expectation |
|---|---|---|
| **Paraphrase** | Rephrase question, change tone/politeness, active/passive | Same answer |
| **Surface noise** | Typos, casing, punctuation, extra whitespace, emojis, OCR errors | Same answer |
| **Format** | Markdown vs plain text, JSON vs prose input, reordered fields/options, long vs short | Same answer / still valid format |
| **Language and dialect** | Translation, code-switching, regional spelling | Same quality |
| **Context variation** | Irrelevant or distracting sentences, longer context, position of the key fact (lost in the middle), reordered retrieved chunks | Same answer |
| **Demographic/entity swaps** | Names, genders, places | Same decision (fairness) |
| **Directional edits** | Change a number or date; negate a condition | Answer changes accordingly |
| **Adversarial** | Injection text in documents, instruction conflicts | Stays on task |
| **Sampling** | Same prompt, different seeds/temperature | Stable semantic answer |

**Metrics**

- **Consistency rate:** fraction of perturbed variants whose answers are equivalent to the original (exact match, embedding similarity, NLI equivalence, or LLM-judge).
- **Robust accuracy:** share of items answered correctly under **all** perturbations; accuracy drop vs clean data; worst-case-group performance.
- Variance of scores across prompts/seeds; format-validity under noise.

```python
def consistency(model, items, perturb, same):
    ok = 0
    for x in items:
        base = model(x)
        ok += all(same(base, model(p(x))) for p in perturb)
    return ok / len(items)
```

**Process:** pick perturbations reflecting **real production variation** (look at logs), generate variants automatically (rules, back-translation, LLM rewriting; check they preserve meaning), run on the golden set, analyse failure clusters, and fix via prompt hardening, input normalisation, fine-tuning on augmented data or guardrails.

**Report** robustness per perturbation type, and set release thresholds (e.g. at least 95% consistency under paraphrase). Add failures to the regression suite.
