**Differences.** Tensors can live on a GPU, carry autograd history (`requires_grad`, `grad_fn`), and support in-place ops tracked by version counters. NumPy arrays are CPU-only with no autograd.

**Memory sharing**
- `torch.from_numpy(a)` and `t.numpy()` (CPU tensors) **share the same buffer**: editing one changes the other.
- `torch.tensor(a)` **copies**. `torch.as_tensor(a)` shares when possible.
- Moving to GPU (`.cuda()`) copies. `.cpu()` on a CPU tensor returns the same tensor.

**Autograd controls**
- `requires_grad=True` tells PyTorch to record operations so `backward()` can compute gradients.
- `x.detach()` returns a tensor sharing data but **cut from the graph**.
- `with torch.no_grad():` stops recording inside the block (evaluation, metric computation) and saves memory.
- `torch.inference_mode()` is a stricter, faster variant for pure inference.

**`loss.numpy()`** raises "Can't call numpy() on Tensor that requires grad" because NumPy has no way to represent the graph. Use:

```python
value = loss.item()                      # scalar to Python float
arr = preds.detach().cpu().numpy()       # tensor to array for plotting or sklearn
```

**Common bugs this prevents**
- Appending `loss` (not `loss.item()`) to a list keeps every iteration's graph alive and memory climbs.
- Forgetting `model.eval()` (dropout, batchnorm behave differently) is a separate issue from `no_grad`; evaluation normally needs both.
- Mutating a tensor in place that autograd saved for backward raises "modified by an inplace operation".
