```python
import os
import shutil
import tempfile
from pathlib import Path

root = Path(tempfile.mkdtemp())                         # a safe, unique scratch directory

# Create
(root / "data" / "raw").mkdir(parents=True, exist_ok=True)
f = root / "data" / "raw" / "a.txt"
f.write_text("hello", encoding="utf-8")
assert f.exists() and f.is_file() and f.suffix == ".txt"

# Copy and move
shutil.copy2(f, root / "data" / "b.txt")                # keeps metadata
f.rename(root / "data" / "moved.txt")                    # same filesystem; use shutil.move across disks
assert not f.exists()

# List
names = sorted(p.name for p in (root / "data").glob("*.txt"))
assert names == ["b.txt", "moved.txt"]

# Delete one file. Path.unlink(missing_ok=True) avoids a FileNotFoundError race.
(root / "data" / "b.txt").unlink(missing_ok=True)
os.remove(root / "data" / "moved.txt")                  # os.remove does the same job

# Delete a whole directory tree (irreversible).
shutil.rmtree(root / "data")
assert not (root / "data").exists()


# Atomic write: readers never see a half-written file.
def atomic_write(path: Path, text: str) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)                               # atomic on the same filesystem

atomic_write(root / "model_meta.json", '{"version": 3}')
assert (root / "model_meta.json").read_text() == '{"version": 3}'
shutil.rmtree(root)
```

**Practices**

- Use **`pathlib.Path`** instead of string concatenation (`/` joins, works on Windows and Linux).
- `os.remove` / `Path.unlink` delete one file, `Path.rmdir` an **empty** directory, `shutil.rmtree` a whole tree. Nothing goes to a recycle bin.
- Use `tempfile` for scratch space, so parallel jobs never collide.
- Write checkpoints and artefacts **atomically** (temp file, then `os.replace`) so a crash cannot leave a corrupt file.

**Dangerous mistakes**

- Building a path to delete from untrusted input (`../../`). Resolve it and confirm it sits inside the expected base directory (`path.resolve().is_relative_to(base)`).
- `shutil.rmtree` on a variable that can be empty or `/`.
- Reading with a relative path and assuming the working directory.
- Not closing files. Use `with open(...)`.
