**Why fairness drifts**

- **Population/data drift:** user mix changes (new regions, languages, demographics), feature distributions shift, base rates change.
- **Feedback loops:** model decisions shape future data (e.g. only approved applicants generate outcome labels; recommendations reinforce popularity), amplifying initial biases.
- **Upstream changes:** data pipelines, feature definitions, vendors, OCR/ASR quality for some groups, new prompts/retrieval content.
- **Model updates or retraining** on skewed recent data; provider model updates for LLM apps.
- **Concept drift:** relationships between features and outcomes change differently across groups.
- **Label/measurement drift** and delayed labels.

**Monitoring design**

1. **Define metrics and thresholds at launch** (parity gaps, TPR/FPR gaps, calibration by group, refusal/toxicity disparities, quality-of-service gaps) with tolerances and severity levels.
2. **Track by group and intersection** over rolling windows with confidence intervals (small groups are noisy: use longer windows, Bayesian smoothing, alert on sustained deviations).
3. **Handle missing protected attributes:** use voluntary self-reported data in secure audit stores, carefully validated proxy methods (e.g. BISG, with known error), or counterfactual/synthetic tests on probe inputs; apply privacy and legal controls.
4. **Leading indicators when labels lag:** input and prediction-distribution drift per group (PSI, KS tests), score distributions, rejection rates, complaint and appeal rates, human-override rates.
5. **Scheduled fairness audits:** replay a fixed **fairness test suite** (counterfactual pairs, benchmark prompts, golden cases per group) against the live system and compare to launch baselines; canary tests after every model/prompt/data change.
6. **Release gates:** block deployments that worsen fairness metrics beyond tolerances.
7. **Alerting and response:** on-call or review board, runbooks (investigate cause, rollback, mitigate with reweighting, threshold review, retraining with balanced data, human review), incident documentation and user remediation where harm occurred.
8. **Governance:** dashboards, periodic reports, model cards updates, retraining cadence, independent audits, record of decisions.

**Prevent feedback loops:** keep some exploration/randomisation or holdouts to collect unbiased outcome data, and evaluate on externally labelled samples.
