**1. Diagnose**

- **Memorisation:** the model emits training text when prompted with a prefix, repeated tokens, or famous passages. Higher for duplicated data, large models, and low-entropy decoding.
- **RAG/tool leakage:** your retriever returns copyrighted documents and the model copies them.
- **User-supplied content** echoed back.

**2. Detect**

```python
def ngrams(t, n=8):
    w = t.split(); return {" ".join(w[i:i+n]) for i in range(len(w)-n+1)}

def verbatim_ratio(output, protected_index, n=8):
    g = ngrams(output, n)
    return len(g & protected_index) / max(len(g), 1)     # block / rewrite if above threshold (e.g. 0.2)
```

Use hashed n-gram indexes (Bloom filter / MinHash) over licensed-protected corpora, code license scanners for generated code, and image/audio fingerprinting.

**3. Prevent**

- **Training time:** deduplicate data, remove or license protected content, use differential privacy or regularisation where practical, and unlearning for specific works.
- **Inference time:** output filter for long verbatim spans (block, truncate, or paraphrase with summary and link), refuse "reproduce the full text of..." requests, prompt policy ("summarise, do not quote more than a short excerpt"), lower exposure of base-model completion mode, limit repetition/prefix attacks.
- **RAG:** only index content you have rights to, attach license metadata, enforce quote limits, return citations/links rather than full text.
- **Product:** rate-limit extraction attempts, monitor for adversarial prompting.

**4. Monitor and respond:** log flagged cases, red team with extraction prompts, maintain a takedown workflow, and review with legal. Measure **verbatim leakage rate** as a release metric.
