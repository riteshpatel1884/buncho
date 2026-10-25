**Static batching:** collect N requests, run them together until **all** finish. Requests have different output lengths, so finished sequences sit idle (padding/wasted compute) while the longest continues; new requests wait for the whole batch. GPU utilisation and throughput are poor.

**Continuous (in-flight, iteration-level) batching** (Orca, 2022): the scheduler operates **per decoding iteration**. After each step:

1. Remove sequences that hit EOS or max tokens, freeing their KV slots.
2. **Admit waiting requests immediately** (run their prefill) if memory/token budget allows.
3. Run the next forward step on the new mix of sequences at different positions.

```python
while True:
    running = [s for s in running if not s.finished]           # evict completed
    while waiting and kv_free() >= waiting[0].needed_blocks:    # fill freed capacity
        running.append(admit(waiting.pop(0)))                   # prefill joins the batch
    step(running)                                               # one decode token for every running seq
```

**Why it helps:** decode is memory-bound, so adding more sequences to each step is nearly free (weights are read once per step), so throughput increases a lot (reported **5 to 20x** vs naive static batching; vLLM claims 2 to 4x vs older systems), and queueing latency drops because new requests do not wait for a full batch.

**Needs:** attention kernels that handle ragged sequences (no padding; PagedAttention) and flexible KV memory (paged allocation).

**Caveats and extensions**

- **Prefill interference:** a long prefill step stalls decoding (high inter-token latency for others). Solutions: **chunked prefill**, prefill-decode disaggregation, token budgets per step.
- Batch size limited by KV memory and latency SLO; use `max_num_seqs` and `max_num_batched_tokens`.
- Fairness/priorities, preemption (swap or recompute) when memory is exhausted.
- Combine with prefix caching and speculative decoding.

Used by vLLM, SGLang, TensorRT-LLM (in-flight batching), TGI, LMDeploy.
