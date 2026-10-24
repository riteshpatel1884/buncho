**Goal:** set prices to maximise a business objective (profit, revenue, sell-through) subject to constraints, as conditions change.

**Architecture**

```text
Data: sales/clicks, inventory & costs, competitor prices, seasonality/events, weather, customer segments
   -> Feature store -> Demand model (price elasticity per product/segment/context; probabilistic forecast)
   -> Optimiser: maximise expected profit(price) subject to constraints
        (min margin, MAP/contract rules, max change %, inventory targets, brand consistency, competitive bounds)
   -> Guardrails & approval (rules, anomaly checks, human review for big moves) -> Price publisher (catalogue/API, cache invalidation)
   -> Experimentation & monitoring -> feedback to models
```

**Core modelling**

- **Demand curve estimation:** model $D(p, x)$ (probability of purchase or units sold given price and context). Naive regression on historical prices is biased because prices were set in response to demand (**endogeneity**): use experiments (randomised price tests), instrumental variables or causal inference methods.
- **Optimisation:** maximise $(p - c)\cdot D(p,x)$ with constraints; for perishable inventory (airlines, hotels) use dynamic programming/revenue management with inventory state; for large catalogues use per-segment models with hierarchical pooling.
- **Exploration vs exploitation:** contextual bandits/Thompson sampling to learn elasticities safely with bounded price ranges.
- **Competitor signals:** legally collected price feeds; avoid tacit collusion patterns and respect competition law.

**Guardrails (as important as the model)**

- Max price change per period, floors/ceilings, consistency across channels, price-gouging protections during emergencies, **no discrimination** on protected attributes, transparency/consumer-protection laws on personalised pricing, brand perception (avoid "yo-yo" prices).
- Kill switch, anomaly detection on price changes (a bug could price items at 0), staged rollout.

**Evaluation:** A/B or geo/time-split experiments measuring profit and revenue **and** conversion, customer satisfaction and complaints; backtesting with counterfactual estimators; monitor long-term effects (loyalty, price perception).

**Where LLMs fit:** extracting competitor or product attributes from text, explaining price changes to analysts, and scenario analysis, **not** setting prices directly.
