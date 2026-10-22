**Layout (installable package)**

```
project/
  pyproject.toml            # dependencies, tool config; lock file committed
  src/mlproj/
    data/        loading.py, validation.py, splits.py
    features/    transforms.py          # used by BOTH training and serving
    models/      model.py, train.py, evaluate.py
    serving/     api.py, schemas.py
    config.py                           # typed settings (Pydantic)
    cli.py                              # mlproj train|evaluate|serve
  configs/       base.yaml, exp_xxx.yaml
  tests/         unit/, integration/, data/
  notebooks/     exploration only; no logic that production depends on
  Makefile or tox/nox, Dockerfile, .github/workflows/
```

**Principles**
- **One feature pipeline.** Preprocessing code lives in `features/` and is imported by training and the API, ideally packaged with the model as one pipeline object. This prevents training/serving skew.
- **Typed configuration.** Hyperparameters, paths and flags in YAML validated by Pydantic; a run is `train --config configs/exp.yaml`. No magic constants in code, secrets from environment variables.
- **Reproducibility.** Pinned dependencies (uv/poetry/pip-tools lock), seeds set in one place, git commit hash, config, data version and metrics logged per run (MLflow or Weights & Biases). Data versioned with DVC, lakeFS or immutable dated snapshots; models saved to a registry with metadata and an evaluation report.

**Testing**
- Unit tests for transforms (shape, dtype, edge cases such as NaN, empty batch, unseen category).
- Data validation tests (schema, ranges, null rates, label balance) using pandera/Great Expectations on every new dataset.
- Smoke test: train for a few steps on a tiny sample and assert the loss decreases; fixed-seed regression test on known inputs.
- Contract test for the API: request schema, response schema and latency budget.

**Quality gates (CI)**
- Formatter and linter (ruff), type checking (mypy/pyright) on the package, tests with coverage thresholds, and a build of the Docker image. Pre-commit hooks locally. Evaluation job that blocks promotion if metrics regress versus the current model.

**Workflow.** Notebooks explore; once an idea works, move the logic into the package with tests. Code review checks for leakage, determinism and docs. Keep a README with a one-command setup and a documented run.

**Trade-offs.** More structure slows the first experiment, so keep a fast path (a scratch folder and notebooks) but require promotion into the package before anything is used in production. Avoid over-engineering with heavy orchestration until the team has recurring pipelines to justify it.
