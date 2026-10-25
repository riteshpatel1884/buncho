**Goal: calibrated trust**, where users rely on the AI when it is right and doubt it when it is not. Blind trust is as bad as distrust.

**Transparency**

- Clearly disclose that it is AI, its purpose, limits, and data use (privacy notice, model card in plain language).
- Show **sources/citations** and, where possible, reasoning or key factors.
- Communicate **uncertainty**: confidence cues, "I'm not sure", abstention instead of guessing.

**Reliability**

- Evaluate and monitor quality; fix visible failure modes; consistent behaviour; graceful fallbacks, and honest error messages.
- Safety: guardrails, refusal policies applied consistently, no manipulative patterns.

**Control**

- Let users **edit, undo, confirm** actions, give feedback (thumbs, corrections), opt out, and reach a **human**.
- Human-in-the-loop for high-stakes steps; reversible defaults.

**Privacy and security**

- Data minimisation, clear retention, no training on user data without consent, strong security and tenant isolation.

**Fairness and accountability**

- Bias audits, appeals/recourse, named ownership, incident disclosure.

**Interaction design**

- Set expectations in onboarding, progressive disclosure of capabilities, avoid anthropomorphic overclaiming, explain why a request was refused.

**Measure trust:** task success, override/acceptance rates (neither 0% nor 100%), user surveys (perceived trust, usefulness), complaint and retention data; **calibration** (confidence vs accuracy).

**Process:** pilot with real users, publish evaluation results and changelogs, and respond openly to incidents.
