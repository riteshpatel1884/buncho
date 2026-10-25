**Define the harm first** (what bias matters for this product):

- **Allocation harms:** unequal decisions or outcomes (loan, hiring, triage).
- **Quality-of-service harms:** worse accuracy/helpfulness for some groups, dialects or languages.
- **Representational harms:** stereotypes, demeaning or erasing content, toxic associations.
- **Safety/toxicity disparities:** more refusals or more toxic completions for certain groups or topics.

**Test designs for LLMs**

1. **Counterfactual / paired prompts:** same prompt with only a demographic attribute swapped (name, gender, religion, nationality, dialect, disability); compare outputs on sentiment, toxicity, refusal, recommendations, tone, competence, and decisions. Statistical test on differences.
2. **Benchmark datasets:** BBQ (question answering bias), WinoBias/WinoGender (coreference), StereoSet, CrowS-Pairs, BOLD and RealToxicityPrompts (open-ended generation toxicity by group), HolisticBias, regard/sentiment metrics; check relevance to your domain and language.
3. **Task-specific audits:** run realistic inputs (resumes, loan notes, support tickets) with attribute variants and compare **outcomes and scores** by group.
4. **Disaggregated performance:** accuracy, refusal rate and quality across groups, languages, dialects and regions.
5. **Open-ended generation analysis:** word associations, occupational/gender stereotypes in stories, image generation demographics and default representations.
6. **LLM-judge and human review** with diverse annotators for subjective harms; calibrate and watch for judge bias.

**Metrics for decisions (classification-like outputs):** demographic parity difference, equal opportunity / equalised odds differences (TPR/FPR gaps), predictive parity/calibration by group, disparate impact ratio (four-fifths rule), error-rate balance.

```python
import numpy as np
def group_gaps(y_true, y_pred, group):
    out = {}
    for g in np.unique(group):
        m = group == g
        out[g] = {"pos_rate": y_pred[m].mean(),
                  "tpr": y_pred[m & (y_true == 1)].mean(),
                  "fpr": y_pred[m & (y_true == 0)].mean()}
    return out    # compare pos_rate (parity), tpr (equal opportunity), fpr across groups
```

**Practice**

- Use **intersectional** slices (not only single attributes) with enough samples; report confidence intervals.
- Test multiple languages and cultures; US-centric benchmarks miss local biases.
- Distinguish **bias in the model** from bias in **retrieval, prompts, tools and data**; test the whole system.
- Document findings (model cards, audit reports), set thresholds and remediation (data balancing, prompt/guardrail changes, fine-tuning, post-processing), then retest and monitor over time.
- Involve affected communities and domain/legal experts, since "fair" has context-dependent definitions.
