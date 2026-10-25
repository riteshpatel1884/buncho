**1. Confirm and quantify**

- Compare selection rates by gender (**four-fifths rule**: ratio of rates under 0.8 signals adverse impact), plus TPR/FPR differences among qualified candidates, with confidence intervals. Use counterfactual tests: swap names, pronouns and gendered words in the same resume and compare scores.
- Handle gender data lawfully (self-ID audit data stored separately; inference only for auditing).

**2. Find the cause**

| Source | Example |
|---|---|
| **Historical label bias** | Trained on past hires/promotions, mostly men (the well-known Amazon case) |
| **Proxy features** | "Women's chess club", women's colleges, career gaps, hobbies, names, word choices |
| **Representation** | Few female examples; different resume styles |
| **Text embeddings** | Gender associations in language models |
| **Process** | Thresholds, job-description wording, sourcing funnel |

**3. Fix**

- **Data:** re-examine labels (use job-performance or skill-assessment outcomes rather than past hiring), rebalance/reweight, augment with counterfactual swaps.
- **Features:** remove names, gender markers, photos, and proxies identified via leakage tests (can a classifier predict gender from the features?); structured skills extraction rather than raw text.
- **Model:** fairness-aware training (reweighing, adversarial debiasing, constraints) or post-processing thresholds (check legality; group-specific thresholds may be restricted in some jurisdictions), calibrate per group.
- **Process:** AI as an aid, not the sole decision; human review of rejections; blind screening; diverse sourcing; structured interviews.

**4. Validate and govern:** re-run audits and counterfactual tests, fairness gates in CI, monitor in production, document in a model card, comply with NYC Local Law 144 / EU AI Act (hiring is high-risk) bias-audit requirements, offer candidate appeal and notice.
