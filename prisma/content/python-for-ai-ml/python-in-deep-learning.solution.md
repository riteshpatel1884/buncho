**Role:** Python is the *control layer*. You describe the model, the data pipeline and the training loop in Python; the framework executes tensor maths in C++/CUDA on CPU or GPU.

**What Python gives you**

- **Framework APIs:** PyTorch, TensorFlow/Keras, JAX are all Python-first.
- **Dynamic graphs:** in PyTorch, normal Python control flow (`if`, `for`) works inside models, so debugging uses normal tools (`print`, `pdb`).
- **Autograd:** `loss.backward()` computes gradients automatically.
- **Experiment tooling:** TensorBoard, Weights & Biases, notebooks to plot loss curves and inspect outputs.
- **Pre-trained models:** Hugging Face and `torchvision` make transfer learning a few lines.

```python
import torch, torch.nn as nn

model = nn.Sequential(nn.Linear(20, 64), nn.ReLU(), nn.Linear(64, 2))
opt = torch.optim.Adam(model.parameters(), lr=1e-3)
loss_fn = nn.CrossEntropyLoss()

for xb, yb in loader:                 # Python orchestrates...
    opt.zero_grad()
    loss = loss_fn(model(xb), yb)     # ...GPU kernels do the maths
    loss.backward()
    opt.step()
```

**Why it matters:** fast iteration (change architecture, rerun) accelerates research, and the same code moves to production via TorchScript/ONNX or a FastAPI service. Caveat: keep tensors on the GPU and avoid Python-level per-element loops, which are the real bottleneck.
