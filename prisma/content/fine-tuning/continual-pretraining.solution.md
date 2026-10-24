**Continual pre-training (CPT, domain-adaptive pre-training)** continues the **unsupervised next-token objective** of pre-training on a large new corpus (domain text, a new language, newer data), starting from an existing checkpoint.

| | Continual pre-training | SFT |
|---|---|---|
| Data | Raw text, billions of tokens | Curated instruction/response pairs, thousands to millions |
| Objective | Next-token on all tokens | Next-token on responses |
| Teaches | **Knowledge, vocabulary, language/domain familiarity** | **Behaviour, format, task skill** |
| Cost | High (many GPU-days) | Low |

**Use it when**

- The domain has **specialised vocabulary and knowledge** the base model lacks (legal, biomedical, chemistry, code in a niche language).
- Adapting to a **new language or script** (often with tokenizer extension).
- You must **update knowledge** to a recent cutoff at scale (though RAG is often easier for facts).
- You have a large unlabeled corpus and a need for a strong domain base before SFT.

**Do not use it when** a small SFT/LoRA run or RAG meets the need.

**Doing it safely**

1. Use a **low learning rate** (about 1/10 of pretraining peak), warmup, and cosine decay.
2. **Replay**: mix 10 to 30% general-domain data to limit forgetting.
3. Clean and deduplicate data; filter quality.
4. If vocabulary is poor, extend the tokenizer and initialise new embeddings carefully.
5. Monitor perplexity on domain **and** general validation sets and run general benchmarks.
6. Follow with **SFT/alignment**: CPT on raw text usually degrades instruction-following and safety, so re-run instruction tuning after.

**Example:** a base model continued on clinical notes and papers, then instruction-tuned for medical QA.
