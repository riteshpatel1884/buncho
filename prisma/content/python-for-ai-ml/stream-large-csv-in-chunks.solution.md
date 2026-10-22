```python
import pandas as pd

usecols = ["country", "amount"]                       # skip heavy columns such as `notes`
dtypes  = {"country": "category", "amount": "float32"}

sums   = pd.Series(dtype="float64")
counts = pd.Series(dtype="float64")

for chunk in pd.read_csv("big.csv", usecols=usecols, dtype=dtypes, chunksize=1_000_000):
    g = chunk.groupby("country", observed=True)["amount"]
    sums   = sums.add(g.sum(), fill_value=0)
    counts = counts.add(g.count(), fill_value=0)

mean_per_country = sums / counts
```

**Key points**
- Read only the **columns** you need and give compact **dtypes** (`category` for low-cardinality strings, `float32`/`int32`), which often cuts memory several times.
- Process with `chunksize` and keep only **small partial aggregates** between chunks. Combine sums and counts, not means of chunk means (that would weight chunks wrongly).
- Always check for `NaN` handling (`count` ignores NaN, `size` does not).

**Better long-term**
1. **Convert once to Parquet** (columnar, compressed, typed). Later reads can select columns and skip data, often 10x or more faster than CSV.
2. Use an engine built for out-of-core work: **DuckDB** (`SELECT country, avg(amount) FROM 'big.csv' GROUP BY 1`), **Polars** lazy scans, or Dask.

Also mention measuring with `df.memory_usage(deep=True)` and not holding references to old chunks.
