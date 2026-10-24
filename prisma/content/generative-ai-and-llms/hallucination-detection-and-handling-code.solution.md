```python
import json, re

def split_claims(answer):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", answer) if len(s.strip()) > 15]

def verify_claim(llm, claim, context):
    prompt = ('Context:\n' + context + '\n\nClaim: ' + claim +
              '\n\nIs the claim fully supported by the context? '
              'Return JSON {"label": "supported|contradicted|not_found", "evidence": "quote or empty"}')
    try:
        return json.loads(llm(prompt, temperature=0))
    except json.JSONDecodeError:
        return {"label": "not_found", "evidence": ""}

def numbers_and_names_grounded(answer, context):
    # cheap deterministic check: every number/capitalised entity must appear in the context
    toks = set(re.findall(r"\b\d[\d,.%]*\b|\b[A-Z][a-z]{2,}\b", answer))
    return [t for t in toks if t not in context]

def check_answer(llm, answer, context, max_unsupported=0):
    claims = split_claims(answer)
    results = [(c, verify_claim(llm, c, context)) for c in claims]
    bad = [(c, r["label"]) for c, r in results if r["label"] != "supported"]
    ungrounded = numbers_and_names_grounded(answer, context)
    ok = len(bad) <= max_unsupported and not ungrounded
    return {"ok": ok, "unsupported": bad, "ungrounded_tokens": ungrounded}

def answer_safely(question, context, generate, llm, retries=1):
    for _ in range(retries + 1):
        ans = generate(question, context)
        report = check_answer(llm, ans, context)
        if report["ok"]:
            return ans
        question += "\nOnly state facts present in the context."
    return "I can't verify an answer to that from the available sources."
```

**Layers of defence**

1. **Prevent:** ground with retrieval, instruct "say I don't know", lower temperature, require citations.
2. **Detect:** claim-level verification against context (NLI model or LLM judge), deterministic checks (numbers, names, quotes, URLs exist), **self-consistency** (sample several answers; disagreement signals risk), token log-probabilities for low confidence.
3. **Handle:** regenerate with stricter instructions, **abstain** or escalate to a human, show citations and confidence, log failures for the eval set.

**Limits:** verifiers also err and cost extra latency; without any source context only **external verification** (search, databases, code execution) can truly check facts. Tune the threshold on labelled examples and measure both missed hallucinations and false alarms.
