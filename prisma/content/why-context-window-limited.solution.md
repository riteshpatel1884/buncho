The limit is not one thing. Several constraints stack.

## 1. Attention compute grows quadratically

Self-attention compares every token with every other token: time $O(T^2d)$ per layer. Doubling the context roughly **quadruples** the attention FLOPs. Naively, the $T\times T$ score matrix is also $O(T^2)$ memory per head, which FlashAttention avoids storing but not computing.

## 2. KV-cache memory grows linearly, and is large

During generation, keys and values for every past token are stored:

$$\text{KV bytes}=2\times L\times n_{kv}\times d_h\times T\times \text{bytes per value}$$

Example, a 70B-class model with $L=80$ layers, $n_{kv}=8$ KV heads (GQA), $d_h=128$, fp16 (2 bytes):

$$2\cdot80\cdot8\cdot128\cdot2\approx 328\text{ KB per token}$$

For $T=128{,}000$ tokens that is about **42 GB for one request**. The weights are about 140 GB in fp16, so long contexts quickly consume the GPUs' memory and **cut the number of concurrent users** (batch size). Without GQA the cache would be several times larger.

## 3. Positional encodings do not extrapolate for free

A model trained on sequences of length $T_{train}$ has never seen larger positions. Quality collapses beyond that length unless positions are rescaled (position interpolation, NTK scaling, YaRN) and the model is further trained on long sequences.

## 4. Training long sequences is expensive and data-limited

Training at long length multiplies compute and activation memory, and genuinely long, coherent training documents are scarce relative to short ones. Models therefore usually pre-train at shorter length and do a **long-context extension phase** at the end.

## 5. Using the context well is a learning problem

Even when a long input fits, models can attend poorly to the middle, get distracted by irrelevant text, and lose precision for retrieval-style questions. A bigger window does not by itself guarantee better use of it.

## 6. Serving economics

Prefill cost, time to first token and price all grow with input length, so providers cap and price long contexts.

## How the limit is being pushed

FlashAttention, GQA/MQA, **sliding-window** and sparse attention, KV-cache quantisation and eviction, paged KV memory, RoPE scaling, prefix caching, and state-space or hybrid architectures with linear-time sequence mixing.
