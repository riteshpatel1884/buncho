**1. Diagnose per component**

| Component | Typical English-only assumption | Check |
|---|---|---|
| Language detection | None | Is the user language detected and passed along? |
| Embeddings / retrieval | English-only embedding model | Query in Hindi against English docs: does recall@k collapse? |
| Documents | Only English content | Is there any content in the user's language? |
| Generation | Prompt demands English | Does it reply in English or mix languages? |
| Tokenizer / limits | English-optimised | Token count per word, truncation, cost |
| Safety / filters | English keyword lists | Are filters bypassed in other languages? |
| Evaluation | English test set only | No data to see the failure |

**2. Fixes**

- **Multilingual embeddings** (for example multilingual-e5, BGE-M3, Cohere multilingual) so queries and documents in different languages share a vector space; hybrid with BM25 per language.
- **Language-aware prompts:** detect language, instruct "answer in the user's language", keep schema keys in English.
- **Content strategy:** translate key documents (machine translation plus review of critical content), or use cross-lingual retrieval and answer in the user's language.
- **Translate-test fallback** for weak languages: translate the query to English, retrieve and answer, translate back (check quality).
- **Model choice:** pick a model with strong coverage for your languages; fine-tune or add few-shot examples for weak ones.
- **Tokeniser cost:** budget more tokens per request and adjust chunk sizes.
- **Safety:** multilingual moderation and red-teaming.

**3. Evaluate:** build test sets per language (native speaker review); report retrieval recall, answer correctness, language-match rate and refusal behaviour per language; set minimum quality bars before launching each language.

```python
lang = detect(query)
docs = retrieve(embed_multilingual(query), k=8)
answer = llm(f"Answer in {lang} using the context only.\nContext: {docs}\nQuestion: {query}")
```
