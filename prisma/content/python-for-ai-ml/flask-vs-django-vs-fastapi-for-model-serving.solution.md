| | **Flask** | **Django** | **FastAPI** |
|---|---|---|---|
| Style | Micro-framework; you pick the pieces | "Batteries included" full-stack (ORM, admin, auth, templates, migrations) | Modern API framework built on type hints |
| Best for | Small services, prototypes, simple internal tools | Full web products with users, a database and an admin UI | Model and LLM APIs, async I/O, typed contracts |
| Validation / docs | Add-ons | Django REST framework | **Built in** (Pydantic request/response models, auto OpenAPI docs) |
| Async | Limited | Improving | **Native** (`async def`) |
| Typical server | gunicorn | gunicorn / uvicorn | uvicorn (behind gunicorn for multiple workers) |

**For a model endpoint, FastAPI is usually the default choice** because of typed validation and automatic docs. Flask is fine for a tiny service. Django is the right tool when the model is *one feature inside* a larger web app that needs users, a database and an admin site. Its three-layer structure is **MTV** (Model, Template, View).

```python
# Flask: minimal prediction service (runs as written)
from flask import Flask, jsonify, request

app = Flask(__name__)
MODEL = None


def get_model():
    global MODEL
    if MODEL is None:                       # load ONCE per process, never inside the request
        MODEL = lambda xs: [sum(xs)]        # stand-in for joblib.load("model.joblib")
    return MODEL


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    features = payload.get("features")
    if not isinstance(features, list) or not all(isinstance(v, (int, float)) for v in features):
        return jsonify(error="features must be a list of numbers"), 400
    return jsonify(prediction=get_model()(features))


client = app.test_client()
assert client.post("/predict", json={"features": [1, 2, 3]}).get_json() == {"prediction": [6]}
assert client.post("/predict", json={"features": "x"}).status_code == 400
```

```python
# FastAPI equivalent (not run here): validation and docs come from the type hints
from fastapi import FastAPI
from pydantic import BaseModel, Field

api = FastAPI()

class Request(BaseModel):
    features: list[float] = Field(min_length=1)

@api.post("/predict")
def predict(req: Request):
    return {"prediction": model.predict([req.features]).tolist()}
```

**Mistakes that hurt production**

- Loading the model **on every request** (slow) or **once per worker** with many workers (memory multiplies, which is a common OOM cause).
- Running the Flask development server in production. Use gunicorn or uvicorn.
- Blocking the event loop with CPU-heavy inference inside `async def`. Use a normal `def` endpoint (run in a thread pool) or a separate worker or inference server.
- No input validation, no timeouts and no health-check route.
- For heavy models, use a dedicated serving layer (Triton, vLLM, TorchServe, BentoML) and keep the web framework as a thin gateway.
