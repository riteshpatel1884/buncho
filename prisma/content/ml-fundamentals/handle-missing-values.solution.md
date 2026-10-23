**1. Diagnose first**

```python
df.isna().mean().sort_values(ascending=False)   # share missing per column
```

Ask *why* values are missing: completely at random, related to other columns, or related to the value itself (e.g. high earners skip the income field). A "missing" flag can itself be a useful feature.

**2. Choose a strategy**

| Situation | Option |
|---|---|
| Column mostly empty, low value | Drop the column |
| Very few rows affected | Drop those rows |
| Numeric, roughly symmetric | Mean (median if skewed or outliers) |
| Categorical | Mode or an explicit `"missing"` category |
| Time series | Forward/backward fill, interpolation |
| Missingness is informative | Add `is_missing` indicator |
| Strong relationships between columns | `KNNImputer`, `IterativeImputer`, or models that handle NaN natively (XGBoost, LightGBM, HistGradientBoosting) |

**3. Do it inside a pipeline (fit on training data only)**

```python
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression

num = Pipeline([("imp", SimpleImputer(strategy="median", add_indicator=True)),
                ("sc", StandardScaler())])
cat = Pipeline([("imp", SimpleImputer(strategy="most_frequent")),
                ("oh", OneHotEncoder(handle_unknown="ignore"))])

pre = ColumnTransformer([("num", num, num_cols), ("cat", cat, cat_cols)])
model = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=1000))])
model.fit(X_train, y_train)      # imputation statistics come from train only
```

**Mistakes to avoid:** imputing before the split (leakage), filling with 0 when 0 is a real value, and silently dropping many rows so the sample becomes biased.
