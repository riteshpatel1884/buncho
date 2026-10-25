**Mechanism:** the model's decisions determine which outcomes are observed, and those outcomes become future training data.

- **Predictive policing:** more patrols in an area leads to more recorded crime there, so the model sends even more patrols (runaway loop).
- **Lending/hiring:** only approved applicants produce repayment/performance labels (**selective labels**); rejected groups never get a chance to prove the model wrong.
- **Recommenders:** exposure drives clicks, amplifying popularity and filter bubbles.

**Breaking the loop**

1. **Exploration:** keep a small randomised/ε-greedy slice (e.g. approve or sample some low-score cases, randomise exposure) to collect **unbiased outcomes**; use contextual bandits with fairness-aware exploration. Ethics review for risk and cost.
2. **Counterfactual/off-policy methods:** inverse propensity weighting, doubly robust estimation; log propensities; **reject inference** for credit.
3. **Better labels and targets:** use ground truth independent of the model (victim reports, audits, external bureau data, random inspections) instead of enforcement-driven records; avoid proxy targets (arrests for crime, cost for health need).
4. **Holdout/control groups:** keep unaffected cohorts or time-based holdouts to compare outcomes.
5. **Modelling choices:** causal models, correct for sampling bias, dampen reinforcing features (location history), cap exposure share, and fairness constraints on allocation.
6. **Monitoring:** track distribution shift of training data vs population, group-wise outcome rates, **loop indicators** (concentration over time), and periodic external audits.
7. **Governance:** human oversight, periodic retraining policy that avoids training only on model-influenced data, stakeholder and community input, ability to pause automated allocation.

**Simulation:** model the dynamics before deployment to see if disparities amplify.
