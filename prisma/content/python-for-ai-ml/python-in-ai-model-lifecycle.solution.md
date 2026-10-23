| Stage | What happens | Typical Python tools |
|---|---|---|
| 1. Data collection | Read files, databases, APIs, scraped data | `pandas`, `requests`, `SQLAlchemy`, `datasets` |
| 2. Preprocessing | Clean, encode, scale, split, build features | `pandas`, `numpy`, `scikit-learn` |
| 3. Model building | Choose algorithm or architecture | `scikit-learn` (classical), `PyTorch` / `TensorFlow` (deep learning) |
| 4. Training | Optimise parameters, tune hyperparameters | PyTorch training loop, `optuna`, GPU via CUDA |
| 5. Evaluation | Metrics, error analysis, explainability | `sklearn.metrics`, `matplotlib`, `shap` |
| 6. Deployment | Expose model as an API or batch job | `FastAPI`, `Docker`, ONNX export |
| 7. Monitoring | Track drift, latency, quality | logging, `evidently`, Prometheus clients |

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

df = pd.read_csv("data.csv").dropna()
X, y = df.drop(columns="label"), df["label"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
model.fit(X_tr, y_tr)
print(classification_report(y_te, model.predict(X_te)))
```

**Key point:** one language covers the whole lifecycle, so there is no hand-off between a research language and a production language. Wrapping preprocessing and model in one `Pipeline` keeps training and serving consistent.
