**Three main designs**

1. **Convert to text, then use standard RAG (simplest)**
   - Run layout-aware parsing; extract tables as HTML/Markdown; run OCR for scans.
   - Use a **vision-language model to caption images/charts** ("Bar chart: Q3 sales by region, EMEA highest at $4.1M") and store the description with the image reference.
   - Embed the text descriptions and surrounding text; at answer time give the LLM the text (and optionally the image).

2. **Multimodal embeddings**
   - Embed images and text into a shared space (CLIP-style or multimodal embedding models); search with text queries to retrieve images directly.
   - Good for photo or diagram search; weaker at reading fine text and numbers.

3. **Document-page embeddings (ColPali-style)**
   - Embed whole **page images** (patch-level multi-vector) and retrieve pages by late interaction; skips OCR and layout parsing.
   - Pass the retrieved page images to a **multimodal LLM** to answer. Strong on visually rich documents; larger index and costs.

**Tables specifically:** keep a **summary for retrieval** and the **full table for generation**; preserve headers and units; chunk by logical table, splitting long tables with repeated headers; for numeric questions, load into a DataFrame or SQL and compute rather than "reading" values.

```python
for item in extract(pdf):                       # text blocks, tables, images
    if item.kind == "image":
        item.text = vlm(f"Describe this figure and any numbers: ", item.image)
    index.add(embed(item.text), meta={"type": item.kind, "page": item.page, "asset": item.asset_path}, text=item.text)
# answer: pass retrieved text + the original images/tables to a multimodal model
```

**Pitfalls:** hallucinated captions (validate), lost provenance (store page, bounding box, asset path for citations), larger storage and cost, latency, access control on images. Evaluate with questions that can only be answered from a figure or table.
