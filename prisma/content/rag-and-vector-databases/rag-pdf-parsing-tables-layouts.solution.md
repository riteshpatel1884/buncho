**Diagnose:** print the parsed text of 20 representative pages and compare with the page image. Typical problems:

- **Reading order:** two-column or sidebar layouts interleaved.
- **Tables flattened** into lines of numbers with lost headers and cell boundaries.
- **Repeated headers/footers and page numbers** injected into text.
- **Scanned pages** with no text layer, or poor OCR.
- Hyphenation, ligatures, footnotes, lost heading hierarchy, multi-page tables.

**Fixes**

1. **Use a layout-aware parser** instead of plain text extraction: for example Docling, Unstructured, LlamaParse, Azure Document Intelligence, AWS Textract, or Marker. They detect blocks (title, paragraph, table, figure), reading order and tables.
2. **Tables:** extract as HTML/Markdown/CSV with headers; repeat headers across multi-page tables; store a text summary for retrieval and the full table for generation; for numeric questions use SQL/pandas.
3. **OCR for scans** (Tesseract, PaddleOCR, cloud OCR) with image cleaning (deskew, denoise); check confidence scores.
4. **Clean up:** remove running headers/footers, fix hyphenation, merge broken lines into paragraphs.
5. **Structure-aware chunking:** split by headings and sections, keep a heading path in each chunk's metadata, and never split a table across chunks.
6. **Vision-language fallback:** for hard pages, render the page as an image and ask a vision LLM to transcribe it to Markdown (costly; use selectively).
7. **Quality gates:** automatic checks (text-to-page ratio, table detection counts, garbled-character ratio) and manual spot checks; route failures to a better parser.

```python
from docling.document_converter import DocumentConverter
result = DocumentConverter().convert("report.pdf")
markdown = result.document.export_to_markdown()      # headings, tables as Markdown, reading order
```

**Evaluate:** build a set of questions whose answers are in tables and complex pages; compare parsers on retrieval hit rate and answer correctness, plus cost per page and speed.
