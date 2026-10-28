```python
import unicodedata

s = "  hello   WORLD  "

assert s.strip() == "hello   WORLD"                 # trims both ends (lstrip / rstrip for one side)
assert s.lower().strip() == "hello   world"
assert "hello world".capitalize() == "Hello world"  # only the first character is upper-cased
assert "hello world".title() == "Hello World"       # every word (imperfect for "don't")
assert "Hello".swapcase() == "hELLO"
assert "a,b,,c".split(",") == ["a", "b", "", "c"]

# split() with no argument splits on any run of whitespace and drops empties.
assert s.split() == ["hello", "WORLD"]
assert s.split(" ") == ["", "", "hello", "", "", "WORLD", "", ""]

words = s.split()
assert " ".join(w.lower() for w in words) == "hello world"   # join is the inverse of split
assert "x".join(["a", "b"]) == "axb"
assert "abc".startswith("ab") and "abc".replace("b", "-") == "a-c"
```

**Strings are immutable.** Every method returns a **new** string, so `s.lower()` alone does nothing. Build text with `"".join(parts)`, not `+=` in a loop.

**Unicode traps**

```python
import unicodedata

a = "café"            # e-acute as one code point
b = "café"           # e + combining accent
assert a != b
assert unicodedata.normalize("NFC", b) == a        # normalise before comparing or deduplicating

assert "STRASSE".casefold() == "straße".casefold() # casefold is the aggressive form of lower()
```

- Use **`casefold()`** (not `lower()`) for case-insensitive matching across languages.
- Normalise with `unicodedata.normalize("NFKC", text)` to merge look-alike forms (full-width characters, ligatures).
- Strip zero-width characters and non-breaking spaces (` `), which `strip()` handles but a hard-coded `" "` does not.
- Do **not** lowercase or strip accents blindly for LLM input. The tokenizer was trained on the raw text, and case carries meaning ("US" vs "us"). Normalise lightly and consistently between training and inference.
