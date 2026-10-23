**Diagnose**

```python
from transformers import AutoTokenizer
tok = AutoTokenizer.from_pretrained("bert-base-uncased")
print(tok.tokenize("pembrolizumab"))     # ['pe', '##mb', '##rol', '##iz', '##uma', '##b']
```

Measure tokens per word on a domain sample, and compare with a general sample.

**Options (cheapest first)**

1. **Do nothing and add context:** modern LLMs often cope; add glossary definitions in the prompt or RAG.
2. **Add tokens to the existing vocabulary** and **resize embeddings**, then train so the new embeddings become meaningful:

```python
tok.add_tokens(["pembrolizumab", "AcmeCloud"])
model.resize_token_embeddings(len(tok))
# initialise new rows as the mean of their old sub-token embeddings, then fine-tune
```

3. **Continue pre-training / fine-tune** on domain text so the model learns the new tokens (new rows alone are random without training).
4. **Train a domain tokenizer** (BPE/SentencePiece) and pre-train a model from scratch; only worthwhile at large scale (BioBERT-style or domain models).
5. **Normalise text** (consistent casing/spelling, avoid odd separators) or use byte-level fallback.

**Trade-offs:** a vocabulary change breaks compatibility with the base model's tokenizer (cached embeddings, other tools) and is often unnecessary with modern large models. Retrieval and fine-tuning usually give most of the benefit.
