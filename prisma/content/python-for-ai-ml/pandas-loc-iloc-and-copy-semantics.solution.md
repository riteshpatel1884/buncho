**`loc` vs `iloc`**
- `loc` is **label-based**: `df.loc[row_labels, col_labels]`. Slices are **inclusive** of the end label. Also accepts boolean masks.
- `iloc` is **position-based** (integers). Slices are **exclusive** of the end, like Python lists.

```python
df.loc[df["score"] > 0.5, "label"] = 1     # mask + column label, one operation
df.iloc[:100, 2:5]                          # first 100 rows, columns 2 to 4
```

**SettingWithCopyWarning.** Chained indexing such as `df[df.a > 0]["b"] = 1` performs *two* operations: the first returns something that may be a copy, so the assignment may write to a temporary and be lost. pandas warns because it cannot tell whether you meant to change the original.

**How to avoid it**
- Do selection and assignment in one `loc` call.
- If you want an independent subset, make that explicit: `sub = df[df.a > 0].copy()`.
- Copy-on-Write semantics (opt-in in pandas 2.x, default in pandas 3.0) make chained assignment never update the parent, so such code simply does nothing, and the rule "one `loc` call" remains the correct pattern either way.

**Performance.** `apply(axis=1)` and `iterrows()` run a Python function per row. Prefer:
- column arithmetic and `np.where` / `np.select`,
- `.str` and `.dt` accessors,
- `groupby(...).agg/transform`, `merge`, `map` with a dict,
- Polars, DuckDB or Numba when the logic is complex.
