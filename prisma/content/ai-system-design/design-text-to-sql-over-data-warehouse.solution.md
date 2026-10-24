**Core problem:** you cannot put thousands of table schemas in the prompt, column names are cryptic, business terms ("active customer") are ambiguous, and a wrong or unsafe query is costly.

**Architecture**

```text
Question -> Intent/clarification (ambiguity? ask) -> Schema linking (retrieve relevant tables/columns/metrics)
   -> SQL generation (LLM with schema + semantic layer + examples + dialect rules)
   -> Validation: parse (AST), allowlist tables/columns, permission check, EXPLAIN/cost guard, LIMIT, read-only
   -> Execute on a replica/sandboxed warehouse role with timeouts -> Result checks (empty/huge/odd values)
   -> Self-repair loop on errors -> Answer: table/chart + SQL + explanation + assumptions
```

**Key components**

- **Metadata catalog + semantic layer:** table/column descriptions, business definitions, metrics (revenue, churn), join paths, certified tables. This matters more than the model.
- **Schema retrieval:** embed table/column docs and sample values; combine with keyword search and usage logs (popular tables), then **rerank** and pass top tables only; a **graph of join keys** to include connecting tables.
- **Few-shot retrieval:** similar past questions with verified SQL ("golden queries").
- **Agentic tools:** `search_tables`, `describe_table`, `sample_rows`, `run_query` with iterative exploration for hard questions.
- **Safety:** read-only credentials, **row/column-level security enforced in the database** (not the prompt), PII masking, query timeout, cost/limit guards, no DDL/DML, audit logging.
- **Trust:** show the SQL and assumptions, allow edits, mark certified vs uncertain answers, thumbs feedback that feeds golden queries.
- **Handling ambiguity:** ask clarifying questions or state the interpretation chosen.

**Evaluation:** execution accuracy (result matches reference) on a curated benchmark of real company questions (not only Spider/BIRD), schema-linking recall, latency, cost, rate of unsafe queries blocked, user trust metrics. Track **silent wrong answers** specially.

**Trade-offs:** autonomy vs verification (human review for high-stakes metrics), freshness of the catalogue, cost of large-model reasoning vs smaller fine-tuned SQL models.
