| | RNN / LSTM | Transformer |
|---|---|---|
| Processing | Sequential: `h_t = f(h_{t-1}, x_t)` | All positions at once via self-attention |
| Training parallelism | Poor (step by step in time) | Excellent (GPU-friendly) |
| Long-range dependencies | Hard: information squeezed through a fixed-size hidden state; vanishing/exploding gradients | Direct connection between any two tokens (path length 1) |
| Memory of the past | Fixed-size state (constant memory) | Whole context (KV cache grows with length) |
| Compute per sequence | `O(n)` | `O(n^2)` attention |
| Inference per token | `O(1)` state update | `O(n)` over the cache |
| Position information | Implicit from order | Needs positional encoding |
| Scaling | Limited | Scales to billions of parameters |

```python
# RNN: loop over time, cannot be parallelised across positions
for t in range(T):
    h = torch.tanh(W_h @ h + W_x @ x[t])
# Transformer: one matrix operation covers all positions
out = torch.softmax(Q @ K.T / d ** 0.5, dim=-1) @ V
```

**Why Transformers won:** parallel training made it feasible to use far more data and compute, and attention captures long-range structure better.

**Where RNN-like ideas return:** the quadratic cost and growing KV cache motivate **state-space and linear-attention models** (Mamba, RWKV, hybrids) that keep a fixed-size state with parallel training.
