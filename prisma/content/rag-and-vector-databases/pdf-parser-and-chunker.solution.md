```python
import re
import fitz  # PyMuPDF  (pip install pymupdf)

def extract_pages(path):
    pages = []
    with fitz.open(path) as doc:
        for i, page in enumerate(doc, start=1):
            text = page.get_text("text")
            pages.append({"page": i, "text": text})
    return pages

def clean(text):
    text = re.sub(r"-\n(\w)", r"\1", text)          # de-hyphenate line-break words
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()

def strip_repeated_lines(pages, min_frac=0.6):
    # remove headers/footers that appear on most pages
    from collections import Counter
    c = Counter(l.strip() for p in pages for l in set(p["text"].splitlines()) if l.strip())
    common = {l for l, n in c.items() if n >= min_frac * len(pages) and len(pages) > 3}
    for p in pages:
        p["text"] = "\n".join(l for l in p["text"].splitlines() if l.strip() not in common)
    return pages

def chunk_pdf(path, size=1000, overlap=150):
    pages = strip_repeated_lines(extract_pages(path))
    chunks = []
    for p in pages:
        text = clean(p["text"])
        if len(text) < 20:                              # likely a scan or blank page
            chunks.append({"page": p["page"], "text": "", "needs_ocr": True})
            continue
        for i in range(0, max(len(text) - overlap, 1), size - overlap):
            chunks.append({"page": p["page"], "text": text[i:i + size], "source": path})
    return chunks
```

**Real-world issues**

- **Scanned PDFs:** no text layer, so run **OCR** (Tesseract, cloud OCR) on pages flagged `needs_ocr`.
- **Tables and multi-column layouts:** plain extraction scrambles reading order; use layout-aware parsers (pdfplumber, Unstructured, Docling) and keep tables as Markdown/HTML chunks.
- **Metadata:** keep `page`, `source`, section heading for citations and filtering.
- **Chunk across pages** when a paragraph spans a page break (merge before splitting) if answers often cross boundaries.
- Validate: count empty pages, check a sample visually, and test retrieval on questions whose answers sit on known pages.
