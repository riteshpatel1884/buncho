**Problem with autoregressive decoding:** tokens are produced one at a time, left to right; latency is proportional to output length and there is no way to revise earlier tokens.

**DLM idea:** adapt diffusion to discrete text. The most common form is **masked (absorbing-state) diffusion**:

- **Forward (noising):** randomly replace tokens with `[MASK]`, with the mask ratio rising from 0 to 100%.
- **Training:** given a partially masked sequence and the noise level, predict the original tokens at the masked positions (a masked-LM loss averaged over all mask ratios) using a **bidirectional** Transformer. Examples: LLaDA, Dream, Mercury (commercial).
- **Generation:** start from all `[MASK]`. Over `K` steps, predict all positions in parallel, **keep the most confident predictions**, re-mask the rest, and repeat until nothing is masked.

```python
x = torch.full((1, L), MASK)
for step in range(K):
    probs = model(x).softmax(-1)
    conf, tok = probs.max(-1)
    conf[x != MASK] = -1                         # keep fixed tokens
    k = int((L - (x != MASK).sum()) / (K - step))
    idx = conf.topk(k, dim=-1).indices
    x[0, idx[0]] = tok[0, idx[0]]
```

**Advantages:** parallel token generation (potentially faster, with fewer steps than tokens), bidirectional context, ability to revise or infill anywhere, controllable generation.

**Limitations:** quality and scaling not yet at the level of the best autoregressive models; fixed or awkward handling of variable length; standard KV caching does not apply directly; the number of denoising steps trades speed against quality; tooling is immature.

**Compare:** AR is trained with a single next-token objective; DLMs generalise masked language modelling into a generative process.
