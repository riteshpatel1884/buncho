**PEP 8** is Python's official style guide: 4-space indentation, `snake_case` for functions and variables, `PascalCase` for classes, `UPPER_CASE` for constants, lines of about 88-100 characters (the formatter's setting), two blank lines between top-level definitions, and imports at the top grouped as standard library, third-party, then local.

```python
import numpy as np


def normalise(x: np.ndarray, eps: float = 1e-8) -> np.ndarray:
    """Scale each column to zero mean and unit variance.

    Args:
        x: Array of shape (n_samples, n_features).
        eps: Small constant that avoids division by zero.

    Returns:
        Array of the same shape as ``x``.

    Raises:
        ValueError: If ``x`` is not 2-D.
    """
    if x.ndim != 2:
        raise ValueError("x must be 2-D")
    # Statistics are computed per column (axis=0), never over the whole matrix.
    return (x - x.mean(axis=0)) / (x.std(axis=0) + eps)
```

**Comments vs docstrings**

- `#` starts a **comment**. Python has no real multi-line comment. Put `#` on each line (editors toggle this with one shortcut). A bare triple-quoted string works but is a string expression, not a comment.
- A **docstring** is the first string in a module, class or function. It is stored in `__doc__`, shown by `help()`, and used by IDEs and doc generators.
- Comment the **why**, not the **what**.

**Enforce it automatically**

- `ruff` (lint plus import sorting) and `black` or `ruff format` (formatting).
- `mypy` or `pyright` for type hints.
- `pre-commit` hooks plus the same checks in CI, so style never depends on reviewers.

**In ML code specifically:** document array shapes and units, name things after what they mean (`val_loss`, not `l2`), and keep experiment constants in one config rather than scattered literals.
