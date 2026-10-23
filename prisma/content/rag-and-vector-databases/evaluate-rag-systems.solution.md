**Evaluate in layers**

**1. Retrieval metrics** (need labelled relevant chunks or documents)

- **Recall@k / hit rate:** share of queries where a relevant chunk is in the top k.
- **MRR, nDCG:** how high the relevant chunk ranks.
- **Context precision:** fraction of retrieved chunks that are actually relevant (and ranked early); measures noise.
- **Context recall:** fraction of the information needed for the reference answer that the retrieved context contains; measures missing evidence.

**2. Generation metrics**

- **Faithfulness / groundedness:** is every claim in the answer supported by the retrieved context? (Split the answer into claims; check each against the context.) Low faithfulness means hallucination.
- **Answer relevance:** does the answer address the question (not off-topic or incomplete)?
- **Answer correctness:** matches the reference answer (semantic similarity, LLM judge).
- Citation accuracy, completeness, tone, refusal quality ("I don't know" when appropriate).

**3. System metrics:** latency (p50, p95), cost per query, failure rate, user feedback.

**Building the eval set**

- 100 to 500 realistic questions from logs, subject experts, and synthetic generation from documents (then human review); include unanswerable, multi-hop, ambiguous and adversarial questions.
- Store reference answers and the ids of supporting chunks.

```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall
result = evaluate(dataset, metrics=[faithfulness, answer_relevancy, context_precision, context_recall])
```

**Method notes:** LLM-as-judge metrics need calibration against human labels and are noisy; fix the judge model, version the dataset, and run the suite in CI on every change (chunking, embedding model, prompt, reranker). Diagnose from the pattern: low context recall means fix retrieval; low faithfulness with good context means fix generation.
