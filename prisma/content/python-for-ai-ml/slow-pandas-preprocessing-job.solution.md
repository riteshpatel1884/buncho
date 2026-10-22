**What the evidence shows**
- About 78% of time is spent in `DataFrame.apply(axis=1)` calls (`clean_row` and `make_key`), which execute a Python function once per row: 30M calls each.
- `iterrows` + `df.loc[i, ...] =` assignment in a loop adds roughly 12%: pure Python, with repeated indexing.
- String columns are `object` dtype, and `df.merge` against a 2M-row lookup happens on a string key, increasing memory and time. The frame is about 22 GB in memory, hence the OOM.
- Data is read from CSV, with all columns, and one `groupby.apply(lambda g: ...)` is used for a per-user feature.

**Prioritised plan**
1. **Replace row-wise `apply` with vectorised column operations** (largest win, likely 50-100x on that part): `str.lower().str.strip()`, `np.where`/`np.select` for branching, string concatenation for keys (`df.a.astype(str) + "_" + df.b.astype(str)`), `pd.to_datetime` on whole columns.
2. **Remove the `iterrows` loop:** compute the values as columns, or use `merge`/`map` for lookups. Expect another large reduction.
3. **Cut memory:** read only needed columns and set compact dtypes (`category`, `int32`, `float32`); convert the CSV source to **Parquet** once (columnar, typed, fast); merge on integer ids or categoricals instead of long strings.
4. **Replace `groupby.apply(lambda)`** with `groupby().agg/transform` using built-in aggregations (or Polars/DuckDB for the whole job).
5. If still needed: process in partitions (by date or user hash) and combine; move to Polars or DuckDB; Numba for truly sequential logic.

**Expected result.** Plausibly 6 h down to 20-40 min, with peak memory under half. State the estimate with its assumptions and confirm with a re-profile after each step.

**Correctness safeguards**
- Freeze a **golden sample** (for example 1M rows) and compare old vs new outputs column by column (`pd.testing.assert_frame_equal` with tolerances), including NaN and edge cases.
- Run both versions in parallel for a few nights and diff outputs; keep the old job as a fallback.
- Add data quality checks (row counts, null rates, key uniqueness) and an alert if runtime or memory exceeds a threshold.

**Process.** Profile first (`cProfile`, `py-spy`, `line_profiler`), change one thing at a time, and record timings so regressions are caught.
