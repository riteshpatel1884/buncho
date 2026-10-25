| Aspect | **Traditional ML** | **LLM applications** |
|---|---|---|
| Output | Label, score, number | Free-form text, code, structured data, actions |
| Ground truth | Usually one correct label | Many valid answers; often **no single reference** |
| Metrics | Accuracy, precision/recall/F1, AUC, RMSE | Task-dependent: judge scores, faithfulness, pass rate, preference win rate, safety rates |
| Evaluation method | Automatic on a labelled test set | Mix of programmatic checks, **LLM-as-judge, human review**, execution-based tests |
| Determinism | Deterministic given the model | **Stochastic** outputs; prompt-sensitive; provider updates change behaviour |
| What is evaluated | A trained model | A **system**: prompt, retrieval, tools, guardrails, model, parameters, orchestration |
| Dimensions | Mostly predictive performance, fairness | Helpfulness, correctness, **hallucination/faithfulness**, safety, tone, format, robustness, latency, **cost per token** |
| Data | Train/validation/test splits from the training distribution | Eval sets built from product needs; you often do not train, so evals are the main development signal; contamination of public data a risk |
| Failure modes | Overfitting, data drift, class imbalance, leakage | Hallucination, prompt injection, jailbreaks, refusals, verbosity, format breaks, tool misuse |
| Generalisation | Held-out test set estimates it | Open-ended inputs; long tail; need slices, adversarial and robustness tests |
| Iteration | Retrain with new data | Edit prompts, retrieval, models; changes can regress other behaviours, so **regression suites** are essential |
| Monitoring | Prediction/data drift, delayed labels | Traces, online judge scores, user feedback, drift in inputs and provider behaviour |
| Cost of evaluation | Cheap | Can be costly (judge calls, human review) |
| Statistics | Standard confidence intervals | Extra noise sources: sampling, judge variance, prompt phrasing |

**Implications**

- Build the **eval set and rubrics first** for LLM apps, since there is no training loss to guide development.
- Evaluate **components and the end-to-end system** (retrieval quality, tool accuracy, final answer).
- Validate automated judges against humans; run **repeated trials** to handle variance.
- Treat prompts, models and datasets as versioned artefacts with CI gates and continuous production evaluation.
- Keep classical metrics where they apply (classification, extraction, ranking inside LLM systems).
