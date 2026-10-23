**Prompt design**

- **Instruction language:** English instructions work well for most models, but state the output language explicitly: "Reply in the same language as the user's message." For languages where quality matters most, test instructions written in that language too.
- **Do not translate delimiters and schema keys;** keep JSON keys and labels in one language (usually English) so downstream code is stable, with values in the user's language when appropriate.
- **Examples:** include few-shot examples in the target languages (or at least in the languages with the weakest performance).
- **Detect language** in code (fastText, `langdetect`) and pass it as a variable rather than trusting the model to guess; handle code-switching.
- Be explicit about **script, formality and locale** (Hindi in Devanagari or Roman script, Brazilian vs European Portuguese, formal "vous" vs "tu"), and about formats for dates, numbers and currency.

**Model and cost issues**

- **Tokenisation:** many languages need 2 to 5x more tokens per word, so cost, latency and context limits are worse; budget for it.
- Quality varies by language (low-resource languages are weaker); choose a model with good coverage and measure it.
- Alternatives: translate to English, process, translate back (translate-test), at the cost of nuance and extra calls.

**Evaluation**

- Build per-language eval sets with native speakers (or reviewed translations); report metrics per language, not only the average.
- Check safety and refusal behaviour in each language too, since jailbreaks often use low-resource languages.

```python
lang = detect_language(user_text)
prompt = f"""Answer the question using the context. Reply in {lang} (formal register).
Keep JSON keys in English.
<context>{ctx}</context>
<question>{user_text}</question>"""
```
