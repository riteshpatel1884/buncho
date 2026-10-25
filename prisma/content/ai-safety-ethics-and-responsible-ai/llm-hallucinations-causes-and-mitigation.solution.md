**Definition:** fluent output that is unfaithful to the source (**intrinsic**) or unsupported by reality (**extrinsic/factual**).

**Why it happens (token-level view)**

- An LLM is trained to predict the **most plausible next token**, not to verify truth. Plausible and true overlap, but not always.
- Sampling from a probability distribution can pick a plausible-but-wrong token, and each wrong token **conditions the rest** (error compounding in autoregressive decoding).
- **Knowledge gaps:** rare facts, long-tail entities, and post-cutoff events have weak or no signal; the model still must emit something.
- **Training incentives:** next-token loss and some RLHF reward confident, helpful-sounding answers over "I don't know"; benchmarks rarely reward abstention.
- Noisy or conflicting training data; weak context use (lost in the middle); ambiguous or false-premise prompts; overly long outputs.

**Mitigations**

| Level | Techniques |
|---|---|
| **Grounding** | RAG with citations, tools/APIs/databases for facts, calculators and code execution |
| **Prompting** | "Answer only from the context; say you don't know", ask for quotes, step-by-step reasoning, structured outputs, lower temperature |
| **Model** | Fine-tune or preference-tune for abstention and faithfulness, stronger base models, calibration training |
| **Verification** | Self-consistency across samples, NLI/claim-check against sources, LLM-judge, citation verification, uncertainty from logprobs |
| **System** | Confidence thresholds with fallback/escalation, retrieval-quality gates, constrained decoding, post-generation validators |
| **UX** | Show sources, flag uncertainty, human review for high-stakes domains |
| **Process** | Hallucination evals in CI, production sampling, feedback loops |

```python
def answer(q, retriever, llm, judge):
    ctx = retriever(q)
    a = llm(f"Use only this context. If missing, say 'I don't know'.\n{ctx}\nQ:{q}")
    return a if judge.supported(a, ctx) else "I couldn't verify that from the sources."
```

You cannot reduce it to zero; design for **detect, contain, and disclose**.
