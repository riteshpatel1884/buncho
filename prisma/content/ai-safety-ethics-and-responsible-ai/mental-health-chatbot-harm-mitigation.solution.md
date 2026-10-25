**Immediate response (incident):** treat as SEV1. Contain (pause or restrict the feature or route to humans), preserve logs, contact the affected user via safe channels if appropriate, notify clinical, legal and safety leads, and meet reporting duties. Run a **blameless post-mortem** (cause: gaps in risk detection, sycophancy, hallucination, long-context drift).

**Product safeguards**

1. **Scope and positioning:** supportive companion/psychoeducation, **not therapy or diagnosis** unless validated and regulated (FDA digital therapeutics, EU MDR); clear AI disclosure and limits, age gating.
2. **Crisis detection:** multi-layer detection of self-harm, suicide, abuse, psychosis, eating disorders (keyword + classifier + LLM-judge over the **whole conversation**, not only the last message); high recall, tested in multiple languages and slang.
3. **Crisis protocol:** switch to a scripted, clinician-approved safe-messaging response (empathy, no method details, encourage immediate help), show **local crisis lines/emergency numbers**, offer **warm handoff** to human counsellors, and where lawful, escalate per duty-of-care policy.
4. **Response policy:** avoid validating harmful beliefs or plans, no instructions that facilitate self-harm, no medical or medication advice, don't encourage dependence or role-play romance; guard against jailbreak ("it's for a story").
5. **Model training:** preference-tune with clinician-written examples, penalise sycophancy, evaluate long-conversation behaviour.
6. **Memory and engagement design:** no manipulative retention tactics; limits on session length and intensity prompts.
7. **Privacy:** sensitive-data protections, minimal retention, explicit consent.

**Validation:** clinician-led **red teaming** with simulated personas, crisis-recall metrics (target near 100% on test sets), harmful-response rate, human review of flagged chats, A/B only under ethics oversight, IRB and clinical trials where claims are made.

**Governance:** clinical advisory board, incident reporting, transparency reports, user feedback and regular audits.
