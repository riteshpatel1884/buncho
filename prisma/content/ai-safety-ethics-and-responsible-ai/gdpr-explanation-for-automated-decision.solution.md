**Legal frame (not legal advice)**

- **Art. 22 GDPR:** people have the right not to be subject to **solely automated decisions with legal or similarly significant effect** (loan denial qualifies), unless a contract necessity, law or explicit consent applies, **with safeguards**: human intervention, the right to express their view and to **contest**.
- **Arts. 13-15:** meaningful information about the **logic involved**, significance and consequences. CJEU (*SCHUFA*, *Dun & Bradstreet Austria*) supports giving understandable reasons, not trade-secret formulas.
- Also: US ECOA/Reg B adverse-action notices with principal reasons; EU AI Act transparency for credit scoring.

**Workflow**

1. **Retrieve the decision record** (inputs, model version, score, threshold) from the audit log.
2. **Generate faithful reasons:** SHAP/reason codes for top factors, or an inherently interpretable scorecard.
3. **Counterfactual guidance:** "approved if debt-to-income were below 35%" (feasible, actionable, legally safe).
4. **Plain-language letter:** key factors, data used (and its source, e.g. credit bureau), how to correct inaccurate data, how to request **human review**, and the contest procedure and timelines (one month under GDPR).
5. **Human re-review** by a trained reviewer with authority to override, not rubber-stamping.
6. **Verify the data:** fix errors (rectification right) and re-score.

```python
def reason_codes(shap_values, feature_names, k=4):
    top = sorted(zip(feature_names, shap_values), key=lambda x: -x[1])[:k]   # positive = pushes to reject
    return [REASON_TEXT[f] for f, v in top if v > 0]
```

**Engineering preparations:** explanation service with tested fidelity, stable reason taxonomy approved by compliance, logging, fairness checks that explanations do not use prohibited factors, user portal for data access, SLA tracking, and periodic audits of reason quality.
