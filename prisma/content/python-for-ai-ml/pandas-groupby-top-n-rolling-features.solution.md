```python
df = df.sort_values(["user_id", "ts"]).reset_index(drop=True)

# 1. top 3 per user
top3 = df.sort_values("amount", ascending=False).groupby("user_id").head(3)

# 2. time-based rolling mean over the previous 7 days (current row excluded)
df["avg_7d"] = (
    df.groupby("user_id")
      .rolling("7D", on="ts", closed="left")["amount"].mean()
      .to_numpy()                            # same order as df because df is sorted by user_id, ts
)

# 3. gap to the previous event for the same user
df["days_since_prev"] = df.groupby("user_id")["ts"].diff().dt.total_seconds() / 86400
```

**Notes**
- `head(3)` after a descending sort is much faster than `groupby.apply(lambda g: g.nlargest(3, "amount"))`. `groupby("user_id")["amount"].nlargest(3)` is another option.
- `rolling("7D", on="ts")` uses a **time window** (needs sorting within each group). `closed="left"` excludes the current timestamp so the window is `[t - 7D, t)`.
- The grouped result is indexed by `(user_id, ts)`, so assigning it back by index alignment silently gives all `NaN`. Because `df` is sorted by `user_id, ts` (the same order the groups come back in), assigning `.to_numpy()` positionally is correct. Keep the sort and the assignment together.
- First row per user gives `NaN` for `avg_7d` and `days_since_prev`. Keep `NaN` (many models handle it) or impute with a flag column.

**Why exclude the current row.** If the label is something about the current transaction (for example fraud), including its own amount in a feature leaks information that is **not available at prediction time**, or at least mixes the target event into its features. Features must be computed only from data strictly before the event time. Use a **time-based** train/validation split for the same reason.
