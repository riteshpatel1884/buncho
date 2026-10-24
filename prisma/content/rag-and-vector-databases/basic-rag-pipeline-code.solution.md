```python
import chromadb
from sentence_transformers import SentenceTransformer
from openai import OpenAI

embedder = SentenceTransformer("BAAI/bge-small-en-v1.5")
db = chromadb.PersistentClient(path="./rag_db")
col = db.get_or_create_collection("docs", metadata={"hnsw:space": "cosine"})
llm = OpenAI()

def chunk(text, size=800, overlap=100):
    step = size - overlap
    return [text[i:i + size] for i in range(0, max(len(text) - overlap, 1), step)]

def index(doc_id, text, source):
    chunks = chunk(text)
    vecs = embedder.encode(chunks, normalize_embeddings=True).tolist()
    col.upsert(                                   # upsert = safe to re-run
        ids=[f"{doc_id}#{i}" for i in range(len(chunks))],
        documents=chunks, embeddings=vecs,
        metadatas=[{"source": source, "chunk": i} for i in range(len(chunks))],
    )

def retrieve(question, k=4):
    qv = embedder.encode([question], normalize_embeddings=True).tolist()
    r = col.query(query_embeddings=qv, n_results=k)
    return list(zip(r["documents"][0], r["metadatas"][0], r["distances"][0]))

def answer(question):
    hits = retrieve(question)
    context = "\n\n".join(f"[{i+1}] ({m['source']}) {d}" for i, (d, m, _) in enumerate(hits))
    prompt = (
        "Answer using ONLY the context. Cite sources like [1]. "
        "If the context does not contain the answer, say you don't know.\n\n"
        f"Context:\n{context}\n\nQuestion: {question}"
    )
    out = llm.chat.completions.create(
        model="gpt-4o-mini", temperature=0,
        messages=[{"role": "user", "content": prompt}])
    return out.choices[0].message.content
```

**Design notes**

- **Same embedding model** for documents and queries; store its name with the collection.
- **Stable ids** (`doc_id#chunk`) plus `upsert` make re-indexing idempotent.
- Normalised vectors + cosine space keep scores consistent.
- Grounding prompt: "only the context", citations, and an explicit "I don't know" path.
- `temperature=0` for repeatable answers.

**Next steps for production:** better chunking (recursive/semantic), hybrid search, a reranker, metadata filters, a similarity threshold to refuse low-confidence retrievals, and a retrieval + faithfulness evaluation set.
