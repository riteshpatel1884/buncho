**Why "fairness through unawareness" fails:** removing gender or race columns does not stop models from using correlated features (ZIP code, school, name, hobbies, gaps in employment, writing style, device type).

**1. Detect proxies**

- **Predictability test:** train a classifier to predict the protected attribute from the model's features/embeddings; AUC well above 0.5 means proxy information exists.
- Correlation / mutual information, feature-importance disaggregated by group, SHAP dependence plots, causal graphs.
- **Counterfactual tests** and disparate-impact measurement on outputs.

**2. Decide business necessity**

- Legally (disparate impact doctrine): a proxy may be allowed only if **job-related and a business necessity** with no less discriminatory alternative. Document and test alternatives.

**3. Mitigate**

- **Remove/transform** problematic features; coarsen (region instead of ZIP), use skills-based structured features.
- **Representation methods:** adversarial debiasing (adversary tries to predict the protected attribute from the representation), learning fair representations, orthogonalising embeddings to the protected direction (INLP), reweighing.
- **Constraints/regularisers:** equalised odds or demographic-parity penalties; **causal approaches** (counterfactual fairness: block paths from the protected attribute that are not justified).
- **Post-processing:** calibrated thresholds where lawful.
- Use **protected attributes in training or auditing** (collected lawfully) to measure and control bias even if not used for decisions.

**4. Verify and monitor:** rerun predictability tests (leakage should drop), disparate-impact ratios, performance by group, **less discriminatory alternative search**, ongoing monitoring, and independent bias audits (e.g. NYC LL144).
