```python
import re

text = "Visit https://example.com/a?x=1 now!!  Or   email bob@mail.com, call 555-1234."

# re.split: split on a pattern (str.split only handles literal separators).
parts = re.split(r"[,.;!?]\s*", "a, b; c!d")
assert parts == ["a", "b", "c", "d"]

# re.sub: replace every match and return the new string.
no_urls = re.sub(r"https?://\S+", "<URL>", text)
assert "<URL>" in no_urls

# re.subn: same, but also returns how many replacements were made.
cleaned, n = re.subn(r"\s+", " ", text)
assert n >= 1 and "  " not in cleaned


URL = re.compile(r"https?://\S+")
EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
SPACES = re.compile(r"\s+")


def clean(s: str) -> tuple[str, int]:
    s, n1 = URL.subn("<URL>", s)
    s, n2 = EMAIL.subn("<EMAIL>", s)
    s = SPACES.sub(" ", s).strip()
    return s, n1 + n2


out, replaced = clean(text)
assert replaced == 2 and "<EMAIL>" in out

# Backreferences and callables in sub:
assert re.sub(r"(\w+) (\w+)", r"\2 \1", "hello world") == "world hello"
assert re.sub(r"\d+", lambda m: str(int(m.group()) * 2), "a1 b20") == "a2 b40"
```

**Pitfalls**

- Use **raw strings** (`r"\d+"`) so backslashes reach the regex engine.
- `re.split` with a capturing group **keeps the separators** in the result.
- Greedy `.*` can swallow too much. Use `.*?` or a precise character class.
- **Catastrophic backtracking:** nested quantifiers such as `(a+)+$` can take exponential time on crafted input. Avoid them on untrusted text.
- Compile patterns used in hot loops. Python caches a few, but explicit `re.compile` is clearer and faster.
- Email and URL regexes are approximations, so treat them as cleaning heuristics, not validation.
- Regex is for cleaning and rule-based extraction. For LLM input, use the model's tokenizer, not a regex split.
