**Leaks**
1. **Scaler fitted on all data** before the split: the test rows influence the mean and std used to transform the training data.
2. **Feature selection fitted on all data and labels:** `SelectKBest(...).fit(X_scaled, y)` has seen the test labels, so selected features are partly chosen *because* they correlate with test targets. This is usually the larger leak, especially with many features and few rows.
3. **Random shuffled split on time-ordered data:** training rows from the future of a test row can leak patterns (and near-duplicate neighbouring days) into training. Production always predicts forward in time.
4. Other usual suspects: duplicate or related rows (same user) across train and test, target-derived features, aggregates that include the label period.

**Fix: split first, fit everything on train only, via a Pipeline**

```python
from sklearn.pipeline import Pipeline
from sklearn.model_selection import TimeSeriesSplit, cross_val_score

pipe = Pipeline([
    ("scale", StandardScaler()),
    ("select", SelectKBest(f_classif, k=20)),
    ("clf", LogisticRegression(max_iter=1000)),
])

cut = int(len(X) * 0.8)                      # data sorted by time
X_train, X_test = X[:cut], X[cut:]
y_train, y_test = y[:cut], y[cut:]
pipe.fit(X_train, y_train)
print(pipe.score(X_test, y_test))

cross_val_score(pipe, X_train, y_train, cv=TimeSeriesSplit(5))   # honest validation
```

**Principle:** any step that learns from data (imputation, scaling, encoding, selection, PCA, target encoding) belongs inside the pipeline and may only see training folds. Split by **group** (user) and by **time** when that mirrors deployment. A suspiciously high offline score is a prompt to hunt for leakage before celebrating.
