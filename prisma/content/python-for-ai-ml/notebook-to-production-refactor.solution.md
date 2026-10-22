**What the notebook shows**
- Preprocessing is done by ad-hoc cells in a specific order (fill NaN with the training-set mean computed on the full dataset, `get_dummies` on the whole frame, scaling with a scaler that is not saved). At serving time those transforms would have to be re-created by hand, creating **training/serving skew**; categories unseen in training would produce different columns.
- Statistics (mean, scaler, selected features) are computed **before the train/test split**: the offline metric is optimistic (leakage), so the first task is to re-establish an honest baseline.
- Random split on time-ordered customer data; no group handling for repeated customers.
- Hard-coded absolute paths, credentials in a cell, no seeds, library versions unknown, global variables shared between cells, manual execution order.
- The model is saved by `pickle.dump(model)` only, without preprocessing or metadata.

**Plan, in order**
1. **Reproduce and fix the evaluation (week 1).** Pin the environment, set seeds, rebuild the experiment as a script with a time-based split and customer-level grouping, fit all learned preprocessing on training data only. Record the honest metric and agree acceptance criteria with the business (expect a lower number than the notebook, and explain why).
2. **Refactor into a package.** Move logic into functions/classes in `src/`, build a single **scikit-learn `Pipeline`/`ColumnTransformer`** (imputer, encoder with `handle_unknown="ignore"`, scaler, model), keep notebooks for exploration only. Configuration (paths, hyperparameters, thresholds) in typed config, secrets in environment variables.
3. **Tests.** Unit tests for each transform and edge cases (missing columns, NaN, unseen category, empty input); schema validation of incoming data (pandera/Pydantic); a smoke-training test on a small sample; a regression test that the saved pipeline reproduces known predictions.
4. **Serialise the whole pipeline** with metadata (library versions, data snapshot id, git commit, metrics), stored in a model registry. Load only trusted artifacts.
5. **Serve.** Batch: a scheduled job (Airflow/cron/Kubernetes CronJob) that reads features, scores, writes results atomically with a run id. API: FastAPI with Pydantic request/response models, model loaded once at startup, input validation, timeouts and structured logging; container image built in CI with the locked dependencies.
6. **Monitor.** Input data quality and drift (feature distributions vs training), prediction distribution, latency and error rate, and, when labels arrive, live accuracy/lift per cohort; alerts and a rollback path to the previous model version. Plan retraining triggers and a shadow period where predictions are logged but not acted on.

**Main risks and mitigations**
- *Metric drop after fixing leakage*: communicate early with evidence; do not ship on the old number.
- *Data availability at prediction time*: verify every feature is available when the score is needed (no features from the future of the prediction date).
- *Skew*: one shared pipeline artifact and parity tests between batch and API outputs.
- *Scope*: cut non-essentials (hyperparameter search, new features) until the baseline is deployed, then iterate.
