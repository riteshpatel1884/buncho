**Diagnose**

- Test queries using jargon, abbreviations and synonyms ("MI" vs "myocardial infarction" vs "heart attack"); look at recall@k per query type.
- Check **retrieval vs generation**: is the right chunk retrieved? If not, it is a matching problem; if yes but misread, it is an understanding problem.
- Inspect tokenisation: rare terms split into meaningless pieces weaken embeddings.

**Retrieval fixes**

1. **Hybrid search (BM25 + dense):** exact-term matching rescues rare names and codes. Often the quickest big win.
2. **Query expansion with a glossary or ontology:** map abbreviations and synonyms (UMLS, internal glossary) and add them to the query, or run multi-query variants.
3. **Document enrichment:** append definitions, synonyms and expanded abbreviations to chunks at ingestion (contextual retrieval).
4. **Domain embedding model:** choose a domain-tuned model or **fine-tune** one on query/passage pairs from your domain (synthetic queries plus hard negatives).
5. **Reranker** fine-tuned or at least tested on domain data.

**Generation fixes**

- Put a short **glossary** of relevant terms into the prompt (retrieved by term match).
- Use a stronger model or a domain-adapted one; instruct it to quote the terms exactly and say when a term is unclear.

```python
GLOSSARY = {"mi": ["myocardial infarction", "heart attack"], "htn": ["hypertension", "high blood pressure"]}
def expand(query):
    extra = [syn for tok in query.lower().split() for syn in GLOSSARY.get(tok, [])]
    return query + " " + " ".join(extra)
```

**Evaluate:** build a jargon-heavy test set (abbreviations, misspellings, synonyms), track recall@k before and after each change, and have domain experts review answers for terminology correctness.
