**Diagnose**

1. **Collect failures** and a labelled error set; categorise (wrong fact, outdated, contradictory, fabricated).
2. **Trace to data:** search the training set for the wrong claim; check contradictions between examples, stale data, unverified synthetic answers, label noise, duplicated wrong answers (repetition amplifies errors).
3. Test whether the **base model** answers correctly, to separate "fine-tuning damaged it" from "the data taught it".
4. Check for **new-knowledge hallucination:** training on facts the base model does not know (even correct ones) teaches the model to **guess confidently**.

**Fix the data (main remedy)**

- **Audit and correct:** verify facts against authoritative sources; expert review of high-impact slices; remove or fix wrong, outdated and contradictory examples.
- Filter synthetic data with verifiers, retrieval grounding or multiple-teacher agreement; deduplicate.
- Add **"I don't know"/refusal** examples for unanswerable questions.
- Add counter-examples and targeted corrections for the observed errors.
- Version data, keep provenance, and add automated checks (schema, consistency, source links).

**Fix the system**

- Move **knowledge out of the weights**: use **RAG** with citations for facts; fine-tune for style, format and grounding behaviour ("answer only from the context").
- Train the model to **cite and quote** sources, then verify citations.
- Use preference training (DPO) with faithful vs hallucinated pairs.
- Lower temperature, add a verification step (judge or rule-based) before returning answers.

**Retrain and validate:** retrain from the base (not on top of the bad run), evaluate on a factual test set plus the original failure cases, and monitor hallucination rate in production with a feedback loop to the dataset.

**Principle:** fine-tuning is a poor way to inject precise facts; garbage in becomes fluent, confident garbage out.
