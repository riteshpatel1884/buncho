Design a question-answering system over **10 million internal documents** (PDFs, wiki pages, tickets, slides) for a company with 20,000 employees.

Requirements:
- Answers must cite sources and respect each user's access permissions.
- Typical question latency under 5 seconds (p95), about 50 queries per second at peak.
- New and edited documents should appear in answers within 15 minutes.
- Cost must be bounded; quality must be measurable.

Describe the architecture, give a rough size and cost estimate for the index, explain how you handle permissions and freshness, and say how you would evaluate and monitor it.
