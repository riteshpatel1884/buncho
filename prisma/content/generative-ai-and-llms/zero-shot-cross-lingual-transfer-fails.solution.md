**What zero-shot cross-lingual transfer is:** fine-tune on labelled data in a **source language** (English) and apply the model to other languages without target-language labels. It relies on the multilingual pre-trained model aligning meanings across languages.

**Why it fails**

- **Low-resource or distant languages:** little pre-training data, different scripts and morphology, so representations are poorly aligned (the "curse of multilinguality" when many languages share limited capacity).
- **Tokenisation:** the tokenizer splits target-language text into many small pieces or byte fallbacks, losing meaning.
- **Task vs language entanglement:** fine-tuning on English only can overwrite alignment (catastrophic forgetting) and tie the task to English patterns.
- **Domain and annotation shift:** label conventions, cultural context and typical phrasing differ.
- **Evaluation artefacts:** translated test sets (translationese) vs natural text.

**Fixes (cheapest first)**

1. **Translate-test:** translate inputs to English, run the English model, map the result back. Quick baseline; adds latency and translation errors.
2. **Translate-train:** machine-translate the English training data into the target languages and fine-tune on it (often a big gain).
3. **Few-shot target data:** even 50 to 500 labelled in-language examples usually gives a large improvement.
4. **Better base model:** choose one with strong coverage and tokenizer for your languages (XLM-R, mT5, BLOOM-style or recent multilingual LLMs).
5. **Continued pre-training / language adapters** on target-language text (MAD-X, LoRA per language) to improve representation.
6. **Mix languages during fine-tuning** (multi-source) rather than English only; use a lower learning rate or freeze lower layers to preserve alignment.
7. **Prompting for LLMs:** in-language few-shot examples, ask the model to reason in English then answer in the target language.
8. **Self-training / pseudo-labelling** on unlabelled target-language text.

**Measure** per-language metrics on **native** (not translated) test sets, and track the transfer gap (English score minus target score).

```python
def translate_test(text, lang):
    en = translate(text, src=lang, tgt="en")
    return english_classifier(en)
```
