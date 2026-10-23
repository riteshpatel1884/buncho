**Why it happens:** next-token training and RLHF reward fluent, helpful-looking answers. Nothing makes abstaining the easy path.

**Fixes (combine several)**

1. **Prompt explicitly:** "Answer only from the provided context. If it is not there, reply exactly: 'I don't know.'" Give examples of correct refusals.
2. **Ground the answer:** use RAG and require citations or quoted evidence; no evidence means no answer.
3. **Check support:** a second pass (LLM judge or NLI model) verifies each claim against the context; withhold unsupported answers.
4. **Use confidence signals:** token log-probabilities, self-consistency (ask several times and check agreement), or a trained calibrator. Raw verbalised confidence is weakly calibrated.
5. **Retrieval-score threshold:** if the best retrieved chunk is below a similarity threshold, return a fallback without calling the model.
6. **Fine-tune on abstention:** include unanswerable questions with "I don't know" targets (and preference data that prefers abstaining over hallucinating).
7. **Product design:** offer to escalate to a human or search.

```python
def answer(q, retriever, llm, min_score=0.35):
    hits = retriever(q)
    if not hits or hits[0].score < min_score:
        return "I don't know based on the available documents."
    return llm(f"Context:\n{hits}\n\nAnswer only from the context, else say you don't know.\nQ: {q}")
```

**Measure:** build an eval set with answerable and unanswerable questions and track both hallucination rate and over-refusal rate; improving one often hurts the other.
