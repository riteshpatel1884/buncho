```python
import matplotlib

matplotlib.use("Agg")            # headless backend: render to files on a server or in CI
import matplotlib.pyplot as plt
import numpy as np

# 1) Learning curves (simulated numbers: replace with your logged metrics)
epochs = np.arange(1, 31)
train_loss = 2.0 * np.exp(-0.15 * epochs) + 0.05
val_loss = 2.0 * np.exp(-0.12 * epochs) + 0.20 + 0.004 * np.maximum(epochs - 15, 0) ** 1.5

fig, ax = plt.subplots(figsize=(6, 4))
ax.plot(epochs, train_loss, label="train")
ax.plot(epochs, val_loss, label="validation")
best = int(val_loss.argmin()) + 1
ax.axvline(best, linestyle="--", color="gray", label=f"best epoch = {best}")
ax.set(xlabel="epoch", ylabel="loss", title="Learning curves")
ax.legend()
fig.tight_layout()
fig.savefig("loss_curves.png", dpi=150)
plt.close(fig)

# 2) 3D loss surface: L(w1, w2) = (w1 - 1)^2 + 3 (w2 + 0.5)^2
w1, w2 = np.meshgrid(np.linspace(-2, 4, 80), np.linspace(-3, 2, 80))
loss = (w1 - 1) ** 2 + 3 * (w2 + 0.5) ** 2

fig = plt.figure(figsize=(6, 5))
ax3 = fig.add_subplot(projection="3d")
ax3.plot_surface(w1, w2, loss, cmap="viridis", alpha=0.9)
ax3.set(xlabel="w1", ylabel="w2", zlabel="loss", title="Loss surface")
fig.savefig("loss_surface.png", dpi=150)
plt.close(fig)

assert loss.shape == (80, 80) and loss.min() < 0.01
```

**Reading learning curves**

- Train loss falls and validation loss falls together: healthy.
- Train keeps falling while validation turns **upward**: **overfitting**. Use early stopping at the best epoch, more data, regularisation or dropout.
- Both high and flat: **underfitting**. Use a bigger model, better features or a higher learning rate.
- Spiky or diverging: learning rate too high or bad data.

**Practical tips**

- `np.meshgrid` builds the 2-D grid of parameter values, and the loss is evaluated on every grid point. That is the inverse of what an optimiser does: it follows the gradient downhill on this surface.
- A **contour plot** (`ax.contourf`) is often clearer than a 3D surface for showing optimiser paths.
- Always call `plt.close(fig)` in loops and jobs to avoid leaking memory.
- For experiments, log metrics to TensorBoard or Weights & Biases rather than re-drawing by hand.
