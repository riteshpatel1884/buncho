**Types**

- **Intrinsic (unfaithful to the provided context):** contradicts or goes beyond the source (RAG, summarisation).
- **Extrinsic / factuality errors:** claims that are false in the real world.
- Fabricated citations, URLs, entities, numbers; wrong tool arguments.

**Method 1: context-grounded (faithfulness)**

1. **Decompose** the answer into atomic claims (LLM).
2. **Verify each claim** against the context: NLI/entailment model (e.g. DeBERTa-based, AlignScore, SummaC) or an LLM judge returning supported / contradicted / not found.
3. **Score** = fraction of supported claims (faithfulness); also report contradicted-claim rate and unsupported-claim count. RAGAS "faithfulness" and TruLens "groundedness" follow this recipe.

**Method 2: open-domain factuality**

- **FActScore / SAFE-style:** break long-form text into facts and verify each by retrieval from a trusted corpus or web search; report precision of supported facts.
- Benchmarks: TruthfulQA, HaluEval, SimpleQA, FACTS-style grounding sets.

**Method 3: reference-free uncertainty signals**

- **SelfCheckGPT:** sample multiple answers; facts that are inconsistent across samples are likely hallucinated.
- Token **log-probabilities / entropy**, semantic entropy, verbalised confidence (weaker calibration).

**Method 4: task-specific checks:** citation validity (does the cited passage support the claim, does the URL exist), entity/number verification against databases, executing generated code or SQL, schema constraints.

**Method 5: human review** of samples, especially for high-stakes domains.

```python
def faithfulness(claims, context, verify):
    verdicts = [verify(c, context) for c in claims]           # "supported" | "contradicted" | "not_found"
    return sum(v == "supported" for v in verdicts) / max(len(claims), 1), verdicts
```

**Practice:** report hallucination rate per slice (topic, document length, query type), measure on unanswerable questions (does the model abstain?), validate automated verifiers against human labels, and track it as an online metric with sampled production traffic. Separate **hallucination rate** from **coverage/recall** (a model that refuses everything has none).
