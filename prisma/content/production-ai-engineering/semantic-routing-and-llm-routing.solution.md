**Semantic routing** selects a destination for each request based on its **meaning and difficulty**: which model (small vs large, general vs code), which pipeline (RAG, SQL, FAQ), or which specialised agent/tool. Goals: cut cost and latency while preserving quality, and improve accuracy through specialisation.

**Router types**

| Type | How | Pros/cons |
|---|---|---|
| **Rule-based** | Keywords, regex, length, user plan, metadata | Fast, transparent; brittle |
| **Embedding similarity (semantic router)** | Embed the query; compare with example utterances per route; choose nearest route above a threshold | Cheap, easy to extend with examples; needs thresholds and a default |
| **Classifier** | Small fine-tuned model (BERT-like) predicts route or difficulty | Fast, accurate with data |
| **LLM router** | A small LLM chooses a route with a prompt | Flexible, higher latency and cost |
| **Learned/preference routers** | Trained on preference data to predict whether a weak model's answer will be good enough (e.g. RouteLLM-style) | Strong cost savings; needs data |
| **Cascade** | Try cheap model first; **escalate** if confidence/verification fails | Simple, robust; adds latency on escalations |

```python
import numpy as np
ROUTES = {"billing": ["refund my payment", "invoice question"],
          "code": ["fix this python error", "write a SQL query"],
          "chitchat": ["hello", "how are you"]}
centroids = {r: np.mean([embed(u) for u in us], axis=0) for r, us in ROUTES.items()}

def route(query, threshold=0.55):
    q = embed(query)
    scores = {r: cos(q, c) for r, c in centroids.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] >= threshold else "default_large_model"
```

**Cascade with confidence:** answer with the small model, estimate confidence (logprobs, self-consistency, verifier or judge, schema/test checks) and **escalate** to the large model when low.

**Operating a router**

- **Evaluate** with labelled queries: routing accuracy, and end-to-end quality vs cost for the whole system (compare "always large" as the upper bound and "always small" as the lower bound); plot the cost-quality curve.
- Include a **safe default** (route unknown or ambiguous queries to the stronger model) and log all decisions.
- Keep router latency tiny (embedding lookup in a few ms), cache decisions, monitor **misroute rates** and drift as query mix changes, and retrain regularly.
- Consider safety/compliance routing (sensitive data to private models, regional models).

**Typical result:** routing 50 to 70% of traffic to smaller models can reduce costs substantially with minimal quality loss, if evaluated carefully.
