| Stage | Key questions and work | Outputs |
|---|---|---|
| **1. Ideation and framing** | Is AI the right tool? User problem, success metric, cost of errors, constraints (privacy, latency, budget), build vs buy | Problem statement, KPIs, risk assessment |
| **2. Feasibility and data** | Can an LLM/ML do this? Data availability, quality, licensing, labelling; quick prototype with prompts | Prototype, data plan, baseline |
| **3. Evaluation design** | Define "good": golden dataset, rubrics, metrics (accuracy, faithfulness, safety, latency, cost), human review | Eval suite, acceptance thresholds |
| **4. Development** | Choose approach (prompting, RAG, fine-tuning, agents), model selection, prompt/config iteration, guardrails | Versioned prompts, pipelines, models |
| **5. Validation and safety** | Offline evals, red teaming, bias and privacy review, load tests, legal/compliance | Go/no-go report |
| **6. Deployment** | CI/CD, staged rollout (shadow, canary, A/B), feature flags, gateway, observability, runbooks | Production release |
| **7. Monitoring and operations** | Quality, latency, cost, drift, incidents, user feedback, on-call | Dashboards, alerts, SLOs |
| **8. Iteration** | Failures become eval cases and training data; model/prompt upgrades; cost optimisation | Next versions (back to stage 3/4) |
| **9. Retirement** | Deprecation, migration, data deletion | Sunset plan |

**What makes AI different from classic software**

- Behaviour is **probabilistic**; testing means evaluation sets and statistics, not only unit tests.
- Quality **drifts** as data, user behaviour and provider models change.
- **Cost and latency** scale with usage and tokens, so they are product constraints from day one.
- **Data and prompts are code**: version them.
- Safety, privacy and regulation (e.g. EU AI Act) are integral, not an afterthought.

**Principles:** start with the simplest approach and an evaluation set; ship behind flags to a small audience; instrument everything; close the loop from production failures back into evals.
