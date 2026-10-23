**Role:** pandas is the workhorse for loading, inspecting, cleaning and reshaping *tabular* data before it becomes model input. A `DataFrame` has labelled columns, mixed dtypes and a rich API, while a NumPy array is homogeneous and unlabelled.

**Typical first-pass cleaning**

```python
import pandas as pd

df = pd.read_csv("raw.csv", parse_dates=["created_at"])

df.info(); df.describe()                      # structure, ranges
df.isna().mean().sort_values(ascending=False) # share missing per column

df = df.drop_duplicates()
df["age"] = df["age"].fillna(df["age"].median())
df["country"] = df["country"].str.strip().str.lower()
df = df[df["price"].between(0, df["price"].quantile(0.99))]   # clip outliers

X = pd.get_dummies(df[["country", "age", "price"]], columns=["country"])
```

**What else it does**

- `groupby`, `merge`, `pivot_table` for aggregation and joins (feature engineering).
- Time-series helpers: `rolling`, `resample`, `shift`.
- Hands clean data to scikit-learn (`X.to_numpy()`), plots with Matplotlib/Seaborn, reads/writes CSV, Parquet, SQL.

**Limits**

- Data must fit in memory; for bigger data use chunking, Polars, Dask or Spark.
- Row-wise `apply` is slow; prefer vectorised column operations.
- Fit any learned preprocessing (mean, encoders) on training data only, preferably inside a scikit-learn `Pipeline`, to avoid leakage.
