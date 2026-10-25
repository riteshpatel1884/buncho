**Document understanding** converts scanned/PDF/image documents (invoices, forms, contracts, reports, receipts) into **structured knowledge** by using text, **layout (2D position)** and **visual** cues together: key-value extraction, table recovery, reading order, classification, QA.

**Why layout matters:** meaning depends on position (a number under "Total" vs "Tax"), multi-column reading order, tables with merged cells, checkboxes, stamps, handwriting.

**Approaches**

| Approach | How | Examples |
|---|---|---|
| **Classic pipeline** | OCR → layout analysis (detect blocks/tables with detectors) → rules/NER | Tesseract, PaddleOCR, Textract, Document AI, Azure Form Recognizer |
| **Layout-aware Transformers** | Tokens + **bounding-box embeddings** (+ image patches) pretrained with masked-language and layout objectives | LayoutLM v1/v2/v3, LiLT, DocFormer, StrucTexT |
| **OCR-free encoder-decoder** | Image → text/JSON directly, no OCR | Donut, Pix2Struct, Nougat (papers → markdown), Kosmos-2.5, TrOCR for lines |
| **Document parsers to markdown** | Layout detection + table recognition + formula models | Docling, Marker, MinerU, Unstructured, olmOCR |
| **General VLMs** | Prompt a VLM with page images to extract JSON or answer questions | GPT-4o/Gemini/Claude vision, Qwen2.5-VL, InternVL; ColPali for page-image retrieval |

**Typical production design**

1. Classify the document type; route to a template/model.
2. Parse (OCR+layout or VLM), keep **bounding boxes and confidences** for provenance.
3. Extract with **schema-constrained output** (JSON schema), validate (totals add up, date formats), cross-check fields.
4. Human review for low confidence; feed corrections back.
5. For RAG: chunk by layout elements (sections, tables as units), include page/box citations.

**Evaluation:** field-level precision/recall/F1 (FUNSD, CORD, SROIE, DocVQA with ANLS), table TEDS, reading-order accuracy, CER, end-to-end straight-through-processing rate.

**Trade-off:** OCR pipelines are cheap, auditable and fast; VLMs are flexible and handle odd layouts but cost more, may hallucinate numbers, and need validation.
