```python
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

num_cols = ["age", "income"]
cat_cols = ["city", "plan"]

preprocess = ColumnTransformer([
    ("num", Pipeline([("impute", SimpleImputer(strategy="median")),
                      ("scale", StandardScaler())]), num_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
])

model = Pipeline([
    ("prep", preprocess),
    ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
])

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(model, X, y, cv=cv, scoring="average_precision")
print(scores.mean(), scores.std())
```

**Why a Pipeline**
- On each fold, the whole chain (imputation medians, scaler means, category lists) is **fitted on the training part only** and then applied to the validation part. Fitting preprocessing on all data first leaks validation statistics into training and inflates scores.
- The same object is saved and used at serving time, so preprocessing cannot diverge between training and production.
- Hyperparameter search works across steps: `GridSearchCV(model, {"clf__C": [0.1, 1, 10]})`.

**Details worth saying**
- `handle_unknown="ignore"` prevents crashes on unseen categories at inference.
- For imbalanced data use stratified folds and a metric such as average precision (PR-AUC), not accuracy. Tune the decision threshold separately.
- For time-ordered data, use `TimeSeriesSplit`, not shuffled folds.
