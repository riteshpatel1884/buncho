**Definition:** a model that generates a sequence one element at a time, each conditioned on everything before it. By the chain rule:

`p(x_1, ..., x_T) = prod_t p(x_t | x_1, ..., x_{t-1})`

GPT, Llama, Claude and PixelCNN-style image models are autoregressive.

**Training:** **teacher forcing**. Feed the true sequence and predict the next token at every position at once; the causal mask prevents looking ahead. All positions train in parallel, with cross-entropy loss.

**Generation:** inherently sequential. Sample a token from `p(x_t | x_<t)`, append it, repeat until a stop token. Each step is a full forward pass (made cheaper by the KV cache).

```python
def generate(model, ids, n, temperature=1.0):
    for _ in range(n):
        logits = model(ids)[:, -1, :] / temperature
        nxt = torch.multinomial(logits.softmax(-1), 1)
        ids = torch.cat([ids, nxt], dim=1)
    return ids
```

**Pros:** exact likelihood, simple objective, scales extremely well, flexible via prompting.

**Cons:** slow sequential decoding (latency grows with output length); **exposure bias** (trained on true prefixes, generates from its own); errors compound; cannot revise earlier tokens; only left-context. Alternatives and speed-ups: speculative decoding, diffusion language models, masked models.
