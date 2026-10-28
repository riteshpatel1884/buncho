| Feature | Benefit | Trade-off |
|---|---|---|
| **Readable syntax, indentation defines blocks** | Consistent, compact code; fast to learn | Whitespace errors (mixing tabs and spaces) are syntax errors |
| **Dynamic typing** | Fast prototyping, flexible code | Type errors appear at run time; use type hints plus `mypy` |
| **Interpreted (bytecode VM)** | Interactive (REPL, notebooks), portable | Slower than compiled languages for pure-Python loops |
| **Automatic memory management** (reference counting plus a cycle collector) | No manual `free` | Less control; memory can stay high; GC pauses |
| **Multi-paradigm** (procedural, object-oriented, functional) | Pick the style that fits | Inconsistent codebases without conventions |
| **Huge standard library and ecosystem** ("batteries included") | NumPy, PyTorch, pandas, scikit-learn, FastAPI | Dependency sprawl and version conflicts |
| **Glue language** with C/C++/CUDA extensions | Fast numerics under a friendly API | Debugging across the Python/C boundary is harder |
| **Open source, cross-platform, large community** | Free, portable, well supported | Packaging and environments are messy |
| **GIL in CPython** | Simple, safe memory model | Threads do not run Python code in parallel (see the GIL question) |

```python
Name = 1
name = 2
assert Name != name                      # identifiers are case sensitive

def f(x):
    if x > 0:
        return "positive"                # indentation is the syntax
    return "non-positive"

assert f(1) == "positive"

x = 10
x = "now a string"                       # dynamic typing: names are re-bound freely
assert isinstance(x, str)
```

**Which features matter for AI work:** the ecosystem and the glue-language design. Python is slow *and* dominant, because the slow part is delegated to optimised native code. Be ready to say when that stops being true (tight custom loops, latency-critical serving) and what you would do (vectorise, `numba`, a compiled extension, or another language for that component).
