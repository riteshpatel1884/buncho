| | **Sparse** | **Dense** |
|---|---|---|
| Shape | Very high-dimensional (vocabulary size), **mostly zeros** | Low-dimensional (e.g. 384 to 3072), **all values non-zero** |
| Built by | Term statistics: TF-IDF, **BM25**; or learned (**SPLADE**) | Neural encoder trained contrastively |
| Each dimension means | A specific term | Nothing human-readable |
| Matches | **Exact terms**, IDs, rare keywords, names | **Meaning**: synonyms, paraphrases, cross-language |
| Fails on | Vocabulary mismatch ("car" vs "automobile") | Rare tokens, codes, exact identifiers, out-of-domain jargon |
| Index | Inverted index (cheap, mature) | ANN index (HNSW, IVF), more memory |
| Explainable | Yes (which terms matched) | Hard |

**Learned sparse (SPLADE):** a model outputs weights over vocabulary terms, including **expansion terms** not in the text, giving sparse vectors that handle some synonymy while keeping inverted-index efficiency.

**In practice use both:** run sparse and dense retrieval, then fuse the ranked lists (e.g. **Reciprocal Rank Fusion**) and optionally rerank. This is **hybrid search**.

**Rule of thumb:** product codes, error messages, legal citations favour sparse; natural-language questions favour dense; production systems usually need both.
