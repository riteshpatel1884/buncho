**Principle:** AI should be an **enhancement, not a single point of failure**. Decide in advance what the product does at each level of failure, and test it.

**Degradation ladder (from best to worst)**

| Tier | Trigger | Behaviour |
|---|---|---|
| 0 Normal | Healthy | Full model, tools, retrieval |
| 1 Reduced quality | Primary slow or rate-limited | Smaller/faster model, shorter context, no reasoning mode |
| 2 Reduced features | Tool or retrieval dependency down | Answer without tools/retrieval, state limitation; disable personalisation |
| 3 Non-AI fallback | All models unavailable | Keyword search, FAQ/decision trees, cached answers, templates, rules |
| 4 Deferred | Cannot serve now | Queue the request and notify later; collect input for follow-up |
| 5 Human | Critical flows | Human agent handoff, status page, clear apology |

**Implementation**

- **Health signals and feature flags:** automatic and manual switches for tiers; load shedding by priority (paid/critical users first).
- **Precomputed and cached content:** common answers, summaries and recommendations stored in advance; **stale-while-error** (serve a slightly old result rather than nothing).
- **Backpressure:** queue limits, admission control, and "try again" responses rather than timeouts piling up.
- **UI/UX:** tell users what is happening ("assistant is limited right now"), keep core non-AI functions working, preserve their input and state so nothing is lost.
- **Safety under degradation:** a weaker fallback must not bypass guardrails; avoid actions with side effects when verification is unavailable.
- **Partial failure handling in agents:** skip failing tools, report what was not done, return partial results.

**Testing:** chaos experiments that disable the model, vector DB or specific tools; verify each tier's behaviour, alerts and recovery (automatic return to Tier 0 without flapping).

**Metrics:** time spent per tier, user task completion during incidents, support contacts, recovery time, error budget.
