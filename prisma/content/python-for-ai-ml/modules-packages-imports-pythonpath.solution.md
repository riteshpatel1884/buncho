**Definitions**

- **Module:** one `.py` file. `import utils` runs it once and caches the result in `sys.modules`.
- **Package:** a directory of modules. It normally has an `__init__.py`; without one it is a *namespace package*.
- **Library / distribution:** a package you install with `pip`.

**Where Python looks (`sys.path`, in order)**

1. The folder of the script you ran (or the current directory in a REPL).
2. Folders listed in the **`PYTHONPATH`** environment variable.
3. The interpreter's standard library.
4. `site-packages` of the active environment.

```python
import sys
print(sys.path[:3])
```

**Why `ModuleNotFoundError` happens:** the project folder is not on `sys.path` when the script runs from elsewhere. The `PYTHONPATH` or `sys.path.append(...)` workarounds are fragile because they depend on the machine and the working directory.

**The proper fix: make the project installable**

```toml
# pyproject.toml
[project]
name = "myproj"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = ["numpy", "pandas"]

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"
```

```bash
pip install -e .        # editable install into the active virtual environment
python -c "import myproj"   # now works from any folder
```

Use a `src/myproj/` layout so tests import the installed package rather than the working directory by accident.

**Common traps**

- A file named like a library (`numpy.py`, `random.py`) **shadows** the real one. Rename it.
- **Circular imports:** move shared code to a third module, or import inside the function.
- `import *` hides where names come from and can overwrite existing ones.
- Prefer absolute imports (`from myproj.data import load`) over long chains of relative ones.
