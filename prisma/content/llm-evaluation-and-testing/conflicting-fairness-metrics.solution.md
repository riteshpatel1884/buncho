**Why conflicts are inevitable**

Fairness metrics encode different ethical notions:

| Metric | Requires |
|---|---|
| **Demographic parity** | Same positive-prediction rate across groups |
| **Equal opportunity** | Same true-positive rate |
| **Equalised odds** | Same TPR **and** FPR |
| **Predictive parity / calibration** | Same precision (PPV) or calibrated scores per group |

**Impossibility results** (Kleinberg et al., Chouldechova): when the groups have **different base rates** and the classifier is imperfect, you **cannot satisfy calibration and equalised odds simultaneously** (and parity generally conflicts with both). So "passes one, fails another" is expected, not a bug.

**How to handle it**

1. **Verify the measurements:** sufficient sample sizes per group, confidence intervals, correct group definitions, intersectional slices, label bias (labels may themselves reflect historical bias), and proxies.
2. **Anchor on context and harm:** what is the decision and who is hurt by which error?
   - Screening where missing a positive is costly (medical triage): prioritise **equal opportunity** (equal recall).
   - Punitive decisions where false positives harm (fraud flags, criminal risk): prioritise **equal FPR**.
   - Resource allocation or access/representation goals, or legal requirements: **demographic parity** or the four-fifths rule may apply.
   - Score used for ranking/decision thresholds by humans: **calibration** matters.
3. **Involve stakeholders:** legal, compliance, ethics, domain experts, affected communities; document the chosen metric and rationale (and the trade-offs accepted) in an audit record or model card.
4. **Mitigate within the chosen criterion:** better and more representative data, reweighting/resampling, group-aware thresholds (where legal), in-processing constraints, post-processing, improving overall model quality (reduces the conflict), removing proxy features, human review for borderline cases.
5. **Quantify trade-offs:** plot accuracy vs fairness metrics for different thresholds/mitigations (Pareto frontier) so decision makers choose consciously.
6. **Check legality:** disparate treatment vs disparate impact rules, jurisdiction-specific requirements (e.g. EU AI Act, US employment and credit law).
7. **Monitor over time** with the agreed metrics and revisit when base rates, populations or regulations change.

**Principle:** fairness is a **value choice constrained by mathematics**; be explicit about which definition you optimise, why, and what you give up.
