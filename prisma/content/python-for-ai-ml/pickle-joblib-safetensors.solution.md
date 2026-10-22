- **`pickle`** serialises almost any Python object. Loading runs code: unpickling can call arbitrary callables (via `__reduce__`), so **loading an untrusted pickle is remote code execution**. Never unpickle files from unknown sources or user uploads.
- **`joblib`** is pickle optimised for objects with large NumPy arrays (compression, memory-mapping). The standard way to save scikit-learn models. **Same security risk.**
- **`torch.save`** is pickle-based underneath. Prefer saving the **`state_dict`** (tensors only) rather than the entire module, because pickling a whole model ties the file to your exact class and module paths. Use `torch.load(path, weights_only=True)` for untrusted or shared checkpoints (this is the default in recent PyTorch versions).
- **`safetensors`** stores only tensors plus metadata in a simple format: **no code execution**, fast loading with zero-copy memory mapping and lazy partial loading. It is the standard for sharing LLM weights (Hugging Face).
- **ONNX / TorchScript / `torch.export`** are for portable inference without the original Python code.

**Compatibility pitfalls**
- Pickled scikit-learn/xgboost models can fail or behave differently across library versions; pin versions and store them with the artifact, or re-train from a saved pipeline definition.
- Pickled custom classes need importable code at the same module path.
- Save the **whole preprocessing pipeline** with the model (scalers, encoders, tokenizer, label map), otherwise training and serving diverge.
- Record metadata: library versions, training data hash, metrics, git commit; sign or checksum artifacts you load in production.
