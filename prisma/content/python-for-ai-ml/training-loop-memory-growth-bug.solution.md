**Bugs**
1. **Missing `optimizer.zero_grad()`.** Gradients accumulate across steps (PyTorch adds to `.grad`), so every update uses the sum of all previous gradients. This destabilises training.
2. **Memory growth:** `losses.append(loss)` and `running += loss` store tensors that still reference their **autograd graph** (intermediate activations), so no step's memory can be freed. Convert to Python numbers with `loss.item()` (or `loss.detach()`).
3. **Validation without `model.eval()`:** dropout stays active and batch norm uses batch statistics and updates its running stats, so results are noisy and change between runs.
4. **Validation without `torch.no_grad()`** builds graphs needlessly and wastes memory.
5. `correct` accumulates a CPU tensor; use `.item()` too, and divide by the dataset size, not the number of batches.

**Fixed code**

```python
model.train()
total, n = 0.0, 0
for x, y in train_loader:
    x, y = x.cuda(non_blocking=True), y.cuda(non_blocking=True)
    optimizer.zero_grad(set_to_none=True)
    out = model(x)
    loss = criterion(out, y)
    loss.backward()
    optimizer.step()
    total += loss.item() * x.size(0)
    n += x.size(0)
print("avg loss", total / n)

model.eval()
correct = seen = 0
with torch.no_grad():                         # or torch.inference_mode()
    for x, y in val_loader:
        preds = model(x.cuda()).argmax(1).cpu()
        correct += (preds == y).sum().item()
        seen += y.size(0)
print("val acc", correct / seen)
```

**Lesson:** accumulate metrics as Python floats, call `eval()` and `no_grad()` for evaluation, and switch back with `model.train()` for the next epoch.
