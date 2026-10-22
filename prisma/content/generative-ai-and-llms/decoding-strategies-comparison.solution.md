## Summary table

| Strategy | How it works | Strengths | Typical failure |
|---|---|---|---|
| **Greedy** | Always pick the argmax token | Fast, deterministic, simple | Repetition loops; locally best choice can lead to a worse whole sequence; bland |
| **Beam search** | Keep the $B$ best partial sequences by total log-probability | Finds higher-likelihood sequences; good when a single correct output exists | Generic, repetitive, short or overly safe text for open-ended generation (the "beam search curse"); $B\times$ cost; needs length normalisation; less diverse |
| **Temperature** | Rescale logits, then sample from the full distribution | Simple diversity control | High $T$ leaves the full tail in play and produces nonsense; low $T$ approaches greedy and repeats |
| **Top-k** | Sample among the $k$ most likely tokens | Cuts off the tail | Fixed $k$ is too loose when the model is confident and too tight when it is uncertain |
| **Top-p (nucleus)** | Sample among the smallest set with mass $\ge p$ | Adapts to confidence | Can keep a large junk-filled set on flat distributions; low $p$ loops |

## Why each failure happens

- **Greedy** ignores the future. A slightly less likely token now can enable a much better continuation. Once it enters a repeated phrase, the repetition raises its own probability, so it never leaves.
- **Beam search** maximises sequence probability, but **human text is not the highest-probability text**. Real language is full of surprising word choices, so beam outputs read as dull and repetitive. It also favours short outputs unless normalised by length.
- **Pure sampling** (temperature 1, no truncation) occasionally draws a token from the long tail, and one odd token then pushes the rest of the text off course.
- **Top-k and top-p** fix the tail problem but at the cost of one more hyper-parameter whose best value depends on the task.

## Recommendations

| Task | Choice | Reason |
|---|---|---|
| **Machine translation, speech recognition, summarisation with a reference** | Beam search (B = 4 to 5) with length penalty | There is a nearly right output; likelihood is a good proxy |
| **Code generation, extraction, SQL, JSON** | Greedy or low temperature (0 to 0.2), possibly with grammar-constrained decoding | Correctness over diversity |
| **Chat assistant** | Temperature about 0.7 with top-p about 0.9 to 0.95 | Natural but controlled |
| **Brainstorming, creative writing** | Higher temperature (0.9 to 1.2) with top-p or min-p | Diversity, while truncation guards against junk |
| **Self-consistency / best-of-N** | Moderate to high temperature, many samples | Needs varied reasoning paths |

## Extra points

- Repetition and frequency penalties and **no-repeat-n-gram** rules reduce loops.
- **Min-p** and **typical sampling** are newer truncation rules.
- For reasoning models, sampling several chains and voting beats greedy for hard problems.
- Beam search is rarely used in chat LLMs: it is costly (it multiplies KV-cache use by $B$) and gives bland text.
- Decoding does not change what the model knows. It only changes how the distribution is read out.
