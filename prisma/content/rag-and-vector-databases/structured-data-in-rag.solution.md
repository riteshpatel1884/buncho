**Why plain text-RAG fails:** embeddings of flattened rows are poor at numbers, filters and aggregation. "Total sales in EMEA last quarter" needs a query, not a similar paragraph.

**Approaches**

| Data | Technique |
|---|---|
| **SQL database** | **Text-to-SQL**: give the LLM the schema (tables, columns, descriptions, sample values, foreign keys), generate SQL, validate, execute, then have the LLM explain the result |
| **Large schemas** | Retrieve only relevant tables/columns (schema linking, embeddings of table descriptions), add example queries (few-shot) |
| **Tables inside documents** | Parse into structured form (HTML/Markdown/CSV); index the table with its caption and section; store a **natural-language summary** for retrieval and the raw table for the answer |
| **Spreadsheets / CSV** | Load into a DataFrame or SQLite; let the model write pandas/SQL via a sandboxed tool |
| **Mixed questions** | A router or agent chooses between vector search (text), SQL (numbers) and both |

```python
def answer_sql(question, schema, db, llm):
    sql = llm(f"Schema:\n{schema}\nWrite one read-only PostgreSQL query for: {question}\nReturn SQL only.")
    assert sql.strip().lower().startswith("select"), "read-only"
    rows = db.execute(sql, timeout=5, limit=100)
    return llm(f"Question: {question}\nSQL: {sql}\nResult: {rows}\nAnswer concisely and mention the filters used.")
```

**Safety and quality**

- Use a **read-only, least-privilege** database user, row limits, timeouts, allow-listed tables; never let user text become SQL directly.
- Apply row-level permissions.
- Validate SQL (parse, `EXPLAIN`), retry with the error message, show the SQL for transparency.
- Add a **semantic layer** (metric definitions like "revenue", fiscal calendars) so the model uses the right logic.
- Evaluate with question-to-expected-result pairs (execution accuracy), not only text similarity.
