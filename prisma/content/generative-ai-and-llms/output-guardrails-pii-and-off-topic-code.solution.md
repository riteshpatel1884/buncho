```python
import re
import numpy as np

PII = {
    "email": re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b"),
    "phone": re.compile(r"(?<!\d)(?:\+?\d{1,3}[ -]?)?(?:\(?\d{3}\)?[ -]?)\d{3}[ -]?\d{4}(?!\d)"),
    "ssn":   re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    "card":  re.compile(r"\b(?:\d[ -]?){13,16}\b"),
}

def luhn(num):
    ds = [int(c) for c in re.sub(r"\D", "", num)][::-1]
    return sum(d if i % 2 == 0 else (d * 2 - 9 if d * 2 > 9 else d * 2) for i, d in enumerate(ds)) % 10 == 0

def redact_pii(text):
    found = []
    for kind, rx in PII.items():
        def sub(m, kind=kind):
            if kind == "card" and not luhn(m.group()):
                return m.group()                          # not a real card number
            found.append(kind)
            return f"[{kind.upper()}]"
        text = rx.sub(sub, text)
    return text, found

class TopicGuard:
    def __init__(self, embed, topic_examples, threshold=0.35):
        v = np.asarray([embed(t) for t in topic_examples], dtype=float)
        self.centroid = (v / np.linalg.norm(v, axis=1, keepdims=True)).mean(0)
        self.centroid /= np.linalg.norm(self.centroid)
        self.embed, self.th = embed, threshold

    def on_topic(self, text):
        e = np.asarray(self.embed(text), dtype=float)
        return float(e / np.linalg.norm(e) @ self.centroid) >= self.th

def guard_output(text, topic_guard, allow_pii=False):
    if not topic_guard.on_topic(text):
        return {"action": "refuse", "text": "I can only help with questions about our product."}
    clean, found = redact_pii(text)
    if found and not allow_pii:
        return {"action": "redact", "text": clean, "pii": sorted(set(found))}
    return {"action": "pass", "text": text}
```

**Design points**

- **Layers:** regex/validators (fast, precise for structured PII), NER models (names, addresses), embeddings or a classifier for topic, an LLM judge for nuanced policy.
- **Actions:** pass, **redact** (PII), **block/refuse** (off-topic, unsafe), **regenerate** with stricter instructions. Choose per failure type.
- **Tune thresholds** with labelled data: measure false refusals as well as misses.
- Apply to **streamed output** by buffering sentences, and log decisions (without logging the PII itself).
- Guardrails reduce risk but do not replace least-privilege data access: do not give the model PII it does not need.
