## Definition

**Logits** are the model's **raw, unnormalised scores** for each token in the vocabulary. They are the output of the final linear layer (the **LM head**) and can be any real number, positive or negative.

For one position the logits vector has length $V$:

$$z=h_{last}\,W_{out}\in\mathbb{R}^{V}$$

where $h_{last}$ is the final hidden state at that position. At every position of the input the model produces such a vector, but generation uses the **last** one.

## From logits to a token

1. **Adjust** (optional): divide by temperature, add a logit bias, apply repetition penalties, mask forbidden tokens by setting them to $-\infty$.
2. **Softmax** converts scores to probabilities:

$$p_i=\frac{e^{z_i}}{\sum_j e^{z_j}}$$

3. **Select** a token: argmax (greedy) or sample after top-k/top-p.
4. Append the token and repeat.

Softmax is **shift-invariant**, so implementations subtract $\max(z)$ first to avoid overflow:

```python
import numpy as np

def softmax(z):
    z = z - np.max(z)
    e = np.exp(z)
    return e / e.sum()
```

## Logits in training

The loss is cross-entropy computed directly from logits using **log-softmax** (numerically stable):

$$\mathcal{L}=-\log p_{y}=-z_y+\log\sum_j e^{z_j}$$

Frameworks fuse this (`cross_entropy` takes logits, not probabilities). Applying softmax yourself and then taking a log loses precision.

## Useful things you can do with logits

- **Control decoding:** temperature, top-k/top-p, repetition penalty, `logit_bias` to push or ban tokens.
- **Constrained generation:** mask every token that would break a JSON schema or grammar, so output is always valid.
- **Confidence and calibration:** token **log-probabilities** (`logprobs`) show how certain the model is; useful for classification scores, uncertainty flags, hallucination heuristics, and reranking.
- **Classification with an LLM:** compare logits of candidate label tokens ("Yes" versus "No").
- **Distillation:** a student is trained to match the teacher's full logit distribution (soft targets), which carries more information than the single correct token.
- **Interpretability:** the "logit lens" projects intermediate hidden states through the LM head to see what the model would predict at each layer.

## Common confusions

- Logits are **not probabilities** and do not sum to 1. Only their differences matter.
- Larger logit does not mean "correct", only "more likely under the model".
- Probabilities from softmax are often **over-confident**, especially after RLHF tuning, so use them as a signal, not as calibrated truth.
