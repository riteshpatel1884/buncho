**Bug.** `df[mask]["label"] = 1` is **chained indexing**: first `df[mask]` builds a new filtered DataFrame (a copy, since boolean masks cannot return a view), then `["label"] = 1` assigns into that temporary object. The original `df` is never touched, so labels remain 0. pandas emits `SettingWithCopyWarning` because it suspects exactly this.

**Fix:** a single `loc` call that performs row selection and column assignment together.

```python
df.loc[df["score"] > 0.5, "label"] = 1
# or: df["label"] = np.where(df["score"] > 0.5, 1, 0)
```

**The variant.** `high = df[mask]` creates a subset; `high["label"] = 1` modifies `high` only, and may warn because pandas cannot be sure whether you intended to edit `df` or a copy. If you want an independent subset, say so explicitly:

```python
high = df[df["score"] > 0.5].copy()
high["label"] = 1                  # clearly modifies only `high`
```

**Version note:** with Copy-on-Write (opt-in in pandas 2.x and the default in pandas 3.0), a derived DataFrame never writes back into its parent, so chained assignment simply never works, and the warning is replaced by consistent behaviour. Writing `loc` assignments or explicit `.copy()` calls is correct in all versions.

**Habit:** never rely on whether an operation returns a view or a copy; write code whose meaning does not depend on it, and test the result (`assert df["label"].sum() == 2`).
