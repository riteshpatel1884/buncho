**Cause: training/serving skew.** The model learned weights for inputs with mean about 0 and standard deviation about 1. Raw values (for example income of 52,000 or age 37) are on a completely different scale, so the learned decision boundary no longer applies and predictions are wrong, often saturated or extreme.

**Fix: apply the identical preprocessing, with training-set statistics, at inference**

- Fit the scaler on **training data only**, and save it with the model.
- Best option: ship one pipeline object so preprocessing cannot be forgotten.

```python
import joblib
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
pipe.fit(X_train, y_train)
joblib.dump(pipe, "model.joblib")          # scaler + model together

# serving
pipe = joblib.load("model.joblib")
pipe.predict(raw_features)                 # scaling happens inside
```

**Common mistakes**

- Re-fitting a new scaler on each request or batch (different statistics).
- Fitting the scaler on all data before the split (leakage).
- Different order or set of columns, or different categorical encoding between training and serving.
- For deep learning: forgetting to apply the same mean/std (or `/255`) that the pretrained model expects.

**Prevention:** add a test that runs training-time and serving-time code on the same sample and compares outputs; validate input ranges in the API; monitor input feature distributions in production to catch skew early.
