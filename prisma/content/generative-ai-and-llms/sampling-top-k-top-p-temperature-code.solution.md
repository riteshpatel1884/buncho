```python
import numpy as np

def softmax(x):
    x = x - x.max()
    e = np.exp(x)
    return e / e.sum()

def sample(logits, temperature=1.0, top_k=0, top_p=1.0, rng=np.random.default_rng()):
    logits = np.asarray(logits, dtype=np.float64)
    if temperature == 0:                                   # greedy
        return int(np.argmax(logits))
    logits = logits / temperature                          # <1 sharpens, >1 flattens

    if top_k and top_k < len(logits):                      # keep k highest logits
        kth = np.sort(logits)[-top_k]
        logits = np.where(logits < kth, -np.inf, logits)

    probs = softmax(logits)

    if top_p < 1.0:                                        # nucleus: smallest set with mass >= p
        order = np.argsort(-probs)
        cum = np.cumsum(probs[order])
        cutoff = np.searchsorted(cum, top_p) + 1           # include the token that crosses p
        keep = order[:cutoff]
        mask = np.zeros_like(probs, dtype=bool); mask[keep] = True
        probs = np.where(mask, probs, 0.0)
        probs /= probs.sum()                               # renormalise

    return int(rng.choice(len(probs), p=probs))

logits = [4.0, 3.0, 1.0, 0.5, -1.0]
print(softmax(np.array(logits)).round(3))                  # [0.687 0.253 0.034 0.021 0.005]
print(sample(logits, temperature=0))                       # always 0
counts = np.bincount([sample(logits, top_k=2) for _ in range(5000)], minlength=5)
print(counts)                                              # only indices 0 and 1 appear
```

**Order used by most libraries:** temperature, then top-k, then top-p, then sample.

| Parameter | Effect | Typical use |
|---|---|---|
| **Temperature** | Rescales confidence; 0 = greedy, higher = more random | 0 to 0.3 factual, 0.7 to 1 creative |
| **Top-k** | Fixed number of candidates | Cuts the long tail; k=40 to 50 |
| **Top-p** | Adaptive candidate set | Keeps few tokens when the model is sure, many when unsure; p=0.9 to 0.95 |

**Notes:** `-inf` after the softmax gives probability exactly 0; always renormalise after truncation; adjust one of temperature or top-p, not both aggressively; sampling controls variety but not truthfulness, and greedy decoding can still loop or repeat.
