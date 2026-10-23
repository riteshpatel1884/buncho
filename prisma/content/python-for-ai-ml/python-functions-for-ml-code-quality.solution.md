**Benefits**

- **Modularity and reuse:** the same `preprocess()` runs in training, evaluation and serving, which prevents training/serving skew.
- **Testability:** a pure function with clear inputs and outputs can be unit-tested; a notebook cell with hidden global state cannot.
- **Readability:** names like `split_data`, `train_model` document intent.
- **Less duplication:** fix a bug once.
- **Safer experiments:** parameters are arguments, not hard-coded values, so runs are reproducible and configurable.

**Example: from one blob to composable functions**

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

def load_data(path: str) -> pd.DataFrame:
    return pd.read_csv(path)

def preprocess(df: pd.DataFrame) -> pd.DataFrame:
    df = df.drop_duplicates().copy()          # never mutate the caller's data
    df["age"] = df["age"].fillna(df["age"].median())
    return df

def split(df: pd.DataFrame, target: str, seed: int = 42):
    X, y = df.drop(columns=target), df[target]
    return train_test_split(X, y, test_size=0.2, random_state=seed, stratify=y)

def train(X, y, **params):
    return RandomForestClassifier(random_state=42, **params).fit(X, y)

def main(path: str):
    X_tr, X_te, y_tr, y_te = split(preprocess(load_data(path)), "label")
    model = train(X_tr, y_tr, n_estimators=200)
    return model.score(X_te, y_te)
```

**Tips:** keep functions small and single-purpose, add type hints and docstrings, avoid mutable default arguments and global state, and return new objects rather than editing inputs.
