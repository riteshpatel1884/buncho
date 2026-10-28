**Short answer:** Python is *both*. CPython (the standard implementation) first **compiles** your source to **bytecode**, then a virtual machine **interprets** that bytecode. "Interpreted" is a property of the implementation, not of the language.

**What happens on `python script.py`**

1. The source is parsed and compiled to bytecode (cached as `.pyc` files in `__pycache__`).
2. The Python virtual machine (PVM) executes the bytecode one instruction at a time.
3. Imported modules go through the same steps, once, and are cached in `sys.modules`.

```python
import dis

def add_scaled(x, y):
    return x + 2 * y

dis.dis(add_scaled)   # prints the bytecode instructions the VM will run
print(add_scaled.__code__.co_code[:8])   # the raw bytecode bytes
```

**Why it matters for ML**

- Each bytecode instruction costs real overhead, so a pure Python loop over millions of numbers is slow.
- Heavy work therefore runs in **compiled C/C++/CUDA code** called from Python (NumPy, PyTorch, scikit-learn). Python only orchestrates.
- Errors that a compiler would catch early (a wrong type, a typo in a rarely-run branch) show up only when that line runs. Use type hints with `mypy` or `pyright`, plus tests.
- When Python itself is the bottleneck, options include vectorisation, `numba`, `torch.compile`, Cython, or an alternative runtime such as PyPy.

**Common follow-up:** "Is Python compiled to machine code?" No. CPython compiles to bytecode, not machine code. Some runtimes and the experimental JIT in newer CPython builds can emit machine code for hot paths.
