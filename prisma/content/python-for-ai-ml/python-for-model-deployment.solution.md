**Steps**

1. **Save the model + preprocessing together** (a scikit-learn `Pipeline` via `joblib`, or `safetensors`/TorchScript/ONNX for deep models). Never unpickle untrusted files.
2. **Wrap it in an API** with FastAPI (or Flask): validate input with Pydantic, load the model **once at startup**, return JSON.
3. **Containerise** with Docker so the environment is identical everywhere.
4. **Run and scale:** several workers behind a load balancer (Kubernetes, ECS, Cloud Run); use a GPU instance or batching for heavy models.
5. **Monitor:** latency (p95/p99), error rate, input drift, prediction distribution, and quality on sampled labelled data.

```python
# app.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel
import joblib

class Features(BaseModel):
    age: float
    income: float

state = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    state["model"] = joblib.load("model.joblib")   # load once
    yield

app = FastAPI(lifespan=lifespan)

@app.post("/predict")
def predict(f: Features):
    p = state["model"].predict_proba([[f.age, f.income]])[0, 1]
    return {"probability": float(p)}
```

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt . 
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

**Pitfalls:** loading the model per request, blocking the event loop with CPU-heavy `async def` handlers, unpinned dependencies, and no version tag on the model artifact.
