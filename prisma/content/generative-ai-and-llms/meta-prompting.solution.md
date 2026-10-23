**Definition:** using a prompt whose job is to **create, critique or improve other prompts** (or to structure how the model approaches a task).

**Uses**

- **Draft generation:** describe the task, audience and constraints; ask for a prompt.
- **Refinement:** give a prompt, failing examples and the expected outputs; ask for a diagnosis and an improved version.
- **Variant generation:** create paraphrased prompts to test sensitivity.
- **Automatic prompt optimisation:** loops that propose candidates, score them on an eval set and keep the best (APE, OPRO, DSPy-style optimisers).
- **Task decomposition:** a "conductor" prompt that splits a problem and writes instructions for sub-tasks.

```text
You are an expert prompt engineer.
Task the prompt must perform: classify support tickets into billing, shipping, technical, other.
Here is the current prompt: <prompt>...</prompt>
These inputs fail (input, expected, actual): <failures>...</failures>
1. Diagnose why each failure happens.
2. Rewrite the prompt to fix them without breaking the passing cases.
3. Return only the new prompt in <prompt> tags.
```

```python
for round in range(5):
    candidate = llm(META_PROMPT.format(prompt=best, failures=sample_failures(best)))
    if evaluate(candidate, dev_set) > evaluate(best, dev_set):
        best = candidate
```

**Risks and limits**

- Generated prompts can look polished but be untested; always score on an eval set.
- Overfitting to the dev set; keep a held-out test set.
- Hidden assumptions or injected instructions in failure data; review the result.
- The optimiser model's biases transfer into the prompt.

**Rule:** meta-prompts speed up drafting, but **evaluation** decides what ships.
