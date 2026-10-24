**Synthetic data** is training data produced by a model (usually a stronger LLM) instead of humans. It is cheap, scalable and controllable, so most modern instruction and reasoning datasets include it.

**Techniques**

- **Self-Instruct / Evol-Instruct:** seed with a few tasks; the LLM generates new instructions, then makes them harder or more varied.
- **Distillation:** a strong teacher answers your prompts; the student is trained on the answers (including reasoning traces).
- **Document-grounded generation:** generate questions and answers from your own documents (good for domain QA).
- **Rejection sampling / best-of-n:** sample several answers, keep those passing a verifier (unit tests, exact answer, judge score).
- **Back-translation, paraphrase, persona and scenario variation** for diversity; **preference pairs** from good vs weak model outputs.

```python
def make_qa(llm, chunk):
    out = llm(f"From the text, write 3 questions a customer might ask and answer each "
              f"using only the text. Return JSON list of {{q, a}}.\n\n{chunk}")
    return json.loads(out)
```

**Quality control (essential)**

1. **Filter:** dedupe, length/format checks, verifier or judge scoring, remove refusals and obvious errors.
2. **Ground** answers in source text and check faithfulness.
3. **Human review** of a sample; keep a **real-data validation set** (never synthetic-only).
4. Ensure **diversity** (topics, difficulty, phrasing); synthetic data collapses to a narrow style if unmanaged.
5. Decontaminate against evaluation sets.

**Risks**

- **Error and bias inheritance** from the teacher; **model collapse** when models train recursively on their own outputs without fresh data.
- **Licensing:** some providers' terms forbid using outputs to train competing models; check before distilling from an API.
- Over-optimising for what the judge likes.

**Best practice:** mix synthetic with real data, verify automatically wherever an answer can be checked, and measure on real-world test cases.
