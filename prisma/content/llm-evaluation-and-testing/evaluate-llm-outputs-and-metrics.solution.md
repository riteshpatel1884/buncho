**Choose by task type**

| Task | Typical metrics |
|---|---|
| Classification / extraction | Accuracy, precision/recall/F1, exact match, field-level F1, JSON validity |
| Question answering | Exact match, token F1, answer correctness (judge), **faithfulness/groundedness** for RAG |
| Summarisation | ROUGE, BERTScore, **factual consistency**, coverage, human or LLM-judge ratings |
| Translation | BLEU, chrF, COMET, human review |
| Code | **Unit-test pass rate, pass@k**, compile rate, static analysis |
| Maths / reasoning | Exact answer match (with normalisation), step correctness |
| Open-ended chat/writing | Human preference, pairwise win rate, LLM-as-judge on rubrics |
| Safety | Attack success rate, refusal correctness, toxicity/PII rates |
| Agents | Task success, tool-call accuracy, steps, cost, recovery |

**Method families**

1. **Reference-based, programmatic:** exact match, string overlap (BLEU/ROUGE), embedding similarity (BERTScore); cheap and reproducible but weak on open-ended text.
2. **Execution-based:** run code, SQL, tests, API calls; strongest signal when available.
3. **Rule/heuristic checks:** regex, schema validation, length, citations present, banned terms, latency and cost.
4. **Model-based:** LLM-as-judge (rubric, pairwise, reference-guided), trained reward models, NLI models for factual consistency.
5. **Human evaluation:** gold standard for subjective quality; expensive, needs guidelines and agreement checks.
6. **Behavioural/online signals:** thumbs, edits, acceptance, task completion, retention.

**Dimensions to cover:** correctness, relevance, completeness, faithfulness, safety, tone/style, format adherence, robustness, latency and cost.

**Good practice**

- Use several complementary metrics; no single score captures quality.
- Build a **versioned eval set** reflecting real traffic, with slices (topic, language, difficulty).
- Validate automated metrics against human judgments before trusting them.
- Report confidence intervals, check variance across runs, and look at failure examples.
- Match offline metrics to online outcomes and revisit when they diverge.
