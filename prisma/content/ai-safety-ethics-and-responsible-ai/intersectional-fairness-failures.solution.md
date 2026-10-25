**Why it happens:** averaging across a single attribute can hide a failing subgroup. Example: Black women may be misclassified far more than white women, Black men and white men combined (Buolamwini and Gebru's Gender Shades). Parity on each marginal does not imply parity on intersections ("**fairness gerrymandering**").

**Audit**

1. **Define slices:** cross-product of protected attributes (gender x race x age band x disability...) plus domain slices (language, region).
2. **Estimate reliably:** report group sizes and **confidence intervals**; small cells are noisy, so use bootstrap/Wilson intervals, Bayesian hierarchical or shrinkage estimates, longer evaluation windows, and targeted data collection rather than ignoring them.
3. **Automatic subgroup discovery:** search for worst-performing slices (decision-tree slice finders, SliceFinder, multicalibration, subgroup scans) and control for multiple testing.
4. Track **worst-group metrics** (min over groups) in addition to averages.

```python
import pandas as pd
def slice_report(df, attrs, min_n=30):
    g = df.groupby(attrs).agg(n=("y", "size"), acc=("correct", "mean"), pos=("pred", "mean"))
    return g[g.n >= min_n].sort_values("acc")      # inspect worst cells; add CIs before acting
```

**Mitigate**

- **Data:** collect or augment under-represented intersections, reweight, balanced sampling, counterfactual augmentation.
- **Training:** group-DRO (minimise worst-group loss), multicalibration / multiaccuracy, fairness constraints for rich subgroup classes, adversarial debiasing.
- **Post-processing:** subgroup-aware thresholds where legal; abstain and route to human review for low-confidence subgroup cases.
- **Product:** transparency about known limits, feedback and appeals.

**Govern:** include intersectional gates in release checklists and monitoring, document limitations (model card), and involve affected communities.
