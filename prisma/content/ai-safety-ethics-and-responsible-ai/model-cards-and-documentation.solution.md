A **model card** (Mitchell et al., 2019) is short structured documentation describing a model's purpose, performance, limits and safe use. Related artefacts: **datasheets for datasets**, **system cards** (whole product incl. safeguards, used for frontier LLMs), and FactSheets.

**Typical contents**

- **Model details:** name, version, owner, architecture, training approach, license, date.
- **Intended use** and **out-of-scope uses**; target users.
- **Training and evaluation data:** sources, size, collection, preprocessing, known gaps.
- **Metrics:** headline and **disaggregated** by group/slice/language, with confidence intervals and conditions.
- **Ethical considerations:** fairness findings, privacy, safety evaluations, red teaming results, misuse risks.
- **Limitations and failure modes**, caveats, recommendations (human oversight, thresholds).
- **Operational:** hardware, latency, monitoring, update policy, contact.

**Why it matters**

1. **Transparency and trust** for users, deployers and downstream teams.
2. **Prevents misuse** by stating what the model is not for.
3. **Regulatory evidence** (EU AI Act technical documentation, NIST AI RMF, model risk governance).
4. **Reproducibility and handover**, easier audits and incident analysis.
5. **Forces reflection**: writing it exposes untested slices.
6. **Procurement and comparison** between models.

**Practice:** generate cards automatically from the training pipeline (Hugging Face model cards, MLflow metadata), update with every release, include limitations honestly, link to eval reports, and review before deployment gates.
