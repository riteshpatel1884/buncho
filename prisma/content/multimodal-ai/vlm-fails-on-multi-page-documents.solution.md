**Why it fails**

- **Token budget:** each page can be 1-4k visual tokens; 50 pages exceed context or cost, so pages are downscaled and text becomes unreadable.
- **Attention dilution / lost in the middle** across many images; weak cross-page reasoning (answers needing page 3 and page 40).
- **No page structure:** the model does not know page numbers, headers, or document hierarchy.
- Training mostly on single images; multi-image support limited.

**Fixes**

1. **Retrieve instead of stuffing:** index each page (page-image embeddings with **ColPali/ColQwen**, OCR text embeddings, or hybrid), retrieve the top 3-8 relevant pages per question, and send only those. Include neighbouring pages when needed.
2. **Parse to structured text:** layout-aware parsing to markdown/JSON with tables, headings, figure captions, page and bounding-box references; use images only for charts/figures needing vision. Cheaper and usually more accurate for text-heavy documents.
3. **Label pages:** interleave "Page 12 of 48" before each image; ask the model to cite pages; provide a table of contents/outline.
4. **Hierarchical / map-reduce:** answer per page or section (extract relevant facts with citations), then synthesise; or build a document summary tree and route questions to sections.
5. **Agentic navigation:** tools such as `search(query)`, `get_page(n)`, `zoom(page, box)` and iterative reading.
6. **Resolution strategy:** adequate DPI for text, region crops for dense tables, avoid downscaling everything.
7. **Model choice/training:** use long-context multi-image VLMs; fine-tune on multi-page QA (MP-DocVQA, SlideVQA, MMLongBench-Doc) with cross-page questions.
8. **Verification:** quote evidence, check numbers against parsed tables.

**Evaluate:** accuracy by number of pages required, retrieval recall@k of the evidence page, citation correctness, latency/cost per question.
