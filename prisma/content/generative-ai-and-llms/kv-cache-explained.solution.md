**Problem:** generating token `t` needs attention over all previous tokens. Without caching you recompute keys and values for the whole prefix at every step, so total work grows quadratically.

**Idea:** in a causal model, keys `K` and values `V` of past tokens never change. Compute them once and store them. For each new token, compute only its own `q, k, v`, append `k, v` to the cache, and attend `q` against the cached `K, V`.

```python
def decode_step(x_new, cache, Wq, Wk, Wv):
    q, k, v = x_new @ Wq, x_new @ Wk, x_new @ Wv
    cache["K"] = torch.cat([cache["K"], k], dim=0)
    cache["V"] = torch.cat([cache["V"], v], dim=0)
    w = torch.softmax(q @ cache["K"].T / k.size(-1) ** 0.5, dim=-1)
    return w @ cache["V"]
```

**Two phases**

- **Prefill:** process the whole prompt in parallel, filling the cache (compute-bound; sets time to first token).
- **Decode:** one token per step reading the whole cache (memory-bandwidth-bound).

**Cost:** the cache grows linearly with sequence length, layers, KV heads and batch size, so it often limits batch size and context length. See `kv-cache-memory-estimate`.

**Why queries are not cached:** the query of a past token is never needed again; only its key and value are read by later tokens.
