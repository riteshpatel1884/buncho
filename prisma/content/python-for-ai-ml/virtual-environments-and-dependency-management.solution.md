**Why isolate:** every project gets its own `site-packages`, so upgrading `numpy` or `torch` for one project cannot break another. Never install project dependencies into the system Python.

```bash
# 1) Install an interpreter version (pyenv, uv, conda, or the official installer)
python3.11 -m venv .venv                 # create the environment
source .venv/bin/activate                # Windows: .venv\Scripts\activate
python -m pip install --upgrade pip

# 2) Install and record dependencies
python -m pip install numpy pandas scikit-learn
python -m pip freeze > requirements.txt  # pins exact versions

# 3) Reproduce on another machine or in CI
python -m venv .venv && source .venv/bin/activate
python -m pip install -r requirements.txt
```

`python -m pip` guarantees that pip belongs to the interpreter you are using, which avoids the common "installed, but still ModuleNotFoundError" problem.

**Declare vs lock**

- **Declared dependencies** in `pyproject.toml` (`pandas>=2.0`): what you need.
- **Lock file** (`uv.lock`, `poetry.lock`, or `pip-compile` output): the **exact versions of everything, including transitive dependencies**, with hashes. Commit it, and install from it in CI and production.

**ML-specific issues**

- **CUDA and GPU wheels:** the `torch` build must match the driver and CUDA version. Pin the index URL or use `conda` for native libraries.
- Different OS or CPU (Apple Silicon vs x86) may need different wheels.
- Pin the **Python version** too (`requires-python`), and the random seeds and data version, or results will not reproduce even with identical packages.
- Notebooks: register the venv as a kernel (`python -m ipykernel install --user --name myproj`) so the notebook uses the right environment.

**Ship it:** build a **Docker image** from the lock file so development, CI and production run the same environment. Run `pip check` and a vulnerability scan (`pip-audit`) in CI.

**`PATH` vs `PYTHONPATH`:** `PATH` decides which `python` and `pip` executables run. `PYTHONPATH` adds folders to the module search path. Activating a venv adjusts `PATH` for you. Avoid setting `PYTHONPATH` globally.
