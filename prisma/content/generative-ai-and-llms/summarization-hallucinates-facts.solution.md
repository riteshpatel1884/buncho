**Why:** the model leans on its prior knowledge, tries to be fluent and "complete", compresses aggressively, and loses information on long inputs.

**Prevent**

- Prompt: "Use only information in the text. Do not add outside knowledge. If unsure, omit." Lower temperature.
- Prefer **extractive-then-abstractive**: select key sentences first, then rewrite.
- Chunk long articles and summarise per chunk with attribution, then merge.
- Ask for quote-level evidence or citations for each claim.
- Fine-tune on faithful summaries; add preference data penalising unsupported claims.

**Detect**

- **Claim verification:** split the summary into atomic claims and check each against the source with an NLI model (SummaC, AlignScore) or an LLM judge.
- **Entity and number check:** every named entity and number in the summary must appear in the source.
- Metrics: faithfulness/factual-consistency scores, not just ROUGE (ROUGE rewards overlap, not truth).

```python
import re
def unsupported_numbers(summary, source):
    nums = set(re.findall(r"\d[\d,.]*", summary))
    return [n for n in nums if n not in source]

if unsupported_numbers(summary, article):
    summary = regenerate_with_feedback(summary, article)
```

**Act:** regenerate or drop flagged sentences, and route high-stakes domains (medical, legal) to human review.
