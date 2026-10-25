**Why reproduction fails:** unversioned data, models or prompts; changing provider models behind an alias; random seeds; non-deterministic GPU kernels and batching (even at temperature 0); undocumented preprocessing or filters; different library versions; evaluation scripts that evolved; private data that cannot be shared.

**Make it reproducible**

1. **Version and archive everything (release bundle):**
   - **Code** (git commit hash), dependency lockfiles and **container images**, hardware/driver info.
   - **Data:** immutable dataset versions with content hashes, split definitions, preprocessing and filtering code; data lineage and provenance.
   - **Model:** weights (hash) or provider **model snapshot id and date** (never a floating alias), tokenizer, chat template, adapters, quantisation.
   - **Prompts and config:** system prompts, templates, tools, retrieval index version, embedding model, hyperparameters, decoding settings (temperature, top-p, max tokens, seed).
   - **Evaluation:** eval-set version, metric implementations, judge prompts and judge model version, scoring scripts, thresholds.
2. **Control randomness:** set seeds (Python, NumPy, framework); use deterministic algorithms where possible; for LLMs use temperature 0 and seeds where offered, and **log raw outputs**. Accept residual non-determinism and define a **tolerance**: report mean and confidence interval over several runs so an auditor can verify results within statistical bounds rather than bit-exactly.
3. **Record raw artefacts:** store model outputs, traces, intermediate scores and per-item results so an auditor can recompute metrics without re-running the model (**replicability** of the analysis even when regeneration varies).
4. **One-command reproduction:** a script/workflow (Make, DVC, MLflow, Kubeflow, notebooks pinned to environment) that fetches the versioned artefacts and regenerates tables and figures; test it in a clean environment (CI).
5. **Documentation:** model card, datasheet for datasets, evaluation protocol, known limitations, change log, decisions on fairness and thresholds.
6. **Access for auditors:** secure sandbox or trusted-research environment with data access under NDA/privacy controls; synthetic or de-identified data and hashes when raw data cannot be shared; third-party escrow of artefacts.
7. **Governance:** immutable audit logs, approvals, retention policy matching regulatory periods, regular reproduction drills (can a new engineer reproduce last quarter's report?).

**Regulatory context:** high-risk systems (EU AI Act, model risk management in finance such as SR 11-7) expect traceability, documentation and logging.

**Tooling:** MLflow, Weights & Biases, DVC, lakeFS, Hugging Face Hub, Docker, Nix/conda-lock, Sigstore/cosign for artefact signing.
