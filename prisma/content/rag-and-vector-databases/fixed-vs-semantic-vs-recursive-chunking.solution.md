| | Fixed-size | Recursive | Semantic |
|---|---|---|---|
| Rule | Cut every N tokens/characters (+ overlap) | Try separators in order (`\n\n`, `\n`, `. `, ` `) until pieces fit the size | Embed sentences; start a new chunk where similarity between neighbours drops |
| Respects structure | No | Mostly (paragraphs, sentences) | Follows topic shifts |
| Chunk sizes | Uniform | Roughly uniform | Variable |
| Cost | Trivial | Trivial | Embedding every sentence at ingestion, more tuning |
| Weakness | Cuts mid-sentence or mid-idea | Ignores meaning | Unstable thresholds, tiny or huge chunks, not always better in benchmarks |
| Best for | Quick baselines, uniform text | **Good default for most text** | Long unstructured prose with clear topic changes |

```python
# recursive (LangChain)
from langchain_text_splitters import RecursiveCharacterTextSplitter
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150,
                                          separators=["\n\n", "\n", ". ", " ", ""])
chunks = splitter.split_text(text)
```

```python
# semantic (idea)
sims = [cos(emb[i], emb[i+1]) for i in range(len(emb) - 1)]
breaks = [i for i, s in enumerate(sims) if s < threshold]    # start a new chunk after each break
```

**Also consider:** structure-aware splitting (Markdown headings, HTML sections, code AST) usually beats all three on structured documents; enforce min/max size limits on semantic chunks.

**Choose by measurement:** compare recall@k and answer quality on your own queries. Recursive with overlap is a strong, cheap baseline.
