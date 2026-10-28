```python
import tempfile
from pathlib import Path

path = Path(tempfile.gettempdir()) / "caps_demo.txt"
path.write_text("Hello World\nPython IS Fun\n", encoding="utf-8")

# One-liner: simple, but .read() loads the entire file into memory.
count = sum(c.isupper() for c in open(path, encoding="utf-8").read())
assert count == 6


# Streaming: constant memory, reads line by line, closes the file for you.
def count_upper(p, chunk_chars: int = 1 << 20) -> int:
    total = 0
    with open(p, encoding="utf-8", errors="replace") as f:
        while chunk := f.read(chunk_chars):          # fixed-size chunks
            total += sum(c.isupper() for c in chunk)
    return total


assert count_upper(path) == 6

# Even simpler when the file has reasonable line lengths:
with open(path, encoding="utf-8") as f:
    assert sum(c.isupper() for line in f for c in line) == 6
```

**Points to make**

- `open(...).read()` creates one string as big as the file. Iterating the file object (`for line in f`) or reading fixed-size chunks keeps memory flat.
- Use a **`with` block** so the file closes even if an error occurs. The bare one-liner leaves closing to the garbage collector.
- Always pass `encoding="utf-8"` (the default depends on the OS) and decide what to do with bad bytes (`errors="replace"`).
- `str.isupper()` is Unicode-aware, so `"É".isupper()` is `True`, and it is `False` for digits and punctuation. If you only want ASCII A-Z, check `"A" <= c <= "Z"`.
- A regex such as `len(re.findall(r"[A-Z]", text))` builds a list of every match. `sum(1 for ...)` or `re.finditer` does not.
- For CPU-bound work on a very large file, split it into byte ranges and process them in parallel with `multiprocessing`.
