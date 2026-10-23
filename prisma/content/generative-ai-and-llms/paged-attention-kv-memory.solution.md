**Problem with naive serving:** each request reserves a contiguous KV buffer for its **maximum** possible length. Memory is wasted through over-reservation, internal fragmentation and external fragmentation, so only a fraction of GPU memory holds useful cache and the batch stays small.

**PagedAttention (vLLM):** borrow virtual memory from operating systems.

- Split the KV cache into fixed-size **blocks** (for example 16 tokens).
- Each sequence has a **block table** mapping logical positions to physical blocks that need not be contiguous.
- Blocks are allocated **on demand** as tokens are generated and freed when the request ends, so waste is limited to the last partial block.
- **Sharing:** requests with the same prefix (system prompt, few-shot examples, parallel samples, beam search) point to the same blocks with copy-on-write, enabling **prefix caching**.

```python
# toy block table
BLOCK = 16
class SeqCache:
    def __init__(self, allocator): self.blocks, self.n, self.alloc = [], 0, allocator
    def append_token(self):
        if self.n % BLOCK == 0:
            self.blocks.append(self.alloc.get_block())
        self.n += 1
```

**Other levers (combine)**

- Continuous batching so finished sequences free memory immediately.
- KV quantisation (FP8/INT8), GQA/MLA models, sliding-window or eviction policies.
- Preemption and swapping to CPU memory, admission control, and `max_tokens` limits.

**Result:** near-zero memory waste and roughly 2 to 4x higher throughput than static allocation in the vLLM paper.
