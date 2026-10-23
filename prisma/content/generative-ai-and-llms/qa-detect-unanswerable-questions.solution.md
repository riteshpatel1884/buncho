**Why:** models are trained to answer; extractive QA heads without a "no answer" class always pick a span.

**Techniques**

1. **Train/evaluate with unanswerable examples** (as in SQuAD 2.0): add a "no answer" option; for extractive models compare the best span score with the null (`[CLS]`) score and abstain above a threshold.
2. **Retrieval confidence:** if retrieved passages have low similarity or low reranker score, abstain.
3. **Evidence check:** require the model to quote the supporting sentence; verify the quote exists in the context (string match) and entails the answer (NLI model or LLM judge).
4. **Answerability classifier:** a small model or prompt "Does the passage contain the answer? yes/no" before answering.
5. **Self-consistency:** sample several answers; high disagreement suggests no grounded answer.
6. **Prompt:** explicitly allow `NOT_FOUND`.

```python
def answer(q, ctx, llm):
    out = llm(f"Context:\n{ctx}\n\nQuestion: {q}\n"
              'Return JSON {"answerable": bool, "quote": str, "answer": str}. '
              "If the context does not answer the question, answerable=false.")
    d = json.loads(out)
    if not d["answerable"] or d["quote"] not in ctx:
        return "The provided document does not answer this question."
    return d["answer"]
```

**Metrics:** precision/recall of abstention, plus answer F1 on answerable questions. Tune the threshold for the cost of wrong answers versus missed answers.
