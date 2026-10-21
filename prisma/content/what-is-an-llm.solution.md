## Short answer

A **large language model** is a neural network, almost always a decoder-only Transformer, trained to predict the next token given all previous tokens. After training on trillions of tokens of text and code, it can continue, summarise, translate, explain and write text, because doing those well helps predict what comes next.

## How it works

Generation is a loop:

1. **Tokenise** the prompt into integer ids.
2. **Embed** each id as a vector.
3. Pass the vectors through $$N$$ Transformer blocks (self-attention plus a feed-forward network) that build a context-aware representation of every position.
4. Project the last position to **logits** over the vocabulary and apply softmax to get a probability distribution.
5. **Sample** a token, append it to the input, and repeat until a stop token or length limit.

Training objective (cross-entropy on next-token prediction):

$$\mathcal{L}(\theta) = -\sum_{t} \log p_\theta\left(x_t \mid x_{<t}\right)$$

## Training stages

| Stage | Data | Result |
|---|---|---|
| Pre-training | Trillions of tokens, self-supervised | Broad knowledge and language ability |
| Supervised fine-tuning | Curated instruction–response pairs | Follows instructions, chat format |
| Preference optimisation (RLHF, DPO and similar) | Human or AI preference comparisons | Helpful, safer, better-styled answers |

## What an LLM is not

It is not a database and has no built-in notion of truth: it produces *plausible* continuations, which is why it can hallucinate. Its knowledge stops at the training cutoff, it only sees what is inside its context window, and sampling makes outputs non-deterministic. Exact arithmetic, precise counting and citing sources from memory are common weak spots, so production systems add tools and retrieval for them.

## Interview follow-up

*"Why does next-token prediction produce reasoning-like behaviour?"* Predicting diverse text well forces the model to learn grammar, facts and the patterns of reasoning that appear in that text. This is an empirical observation, not a guarantee of correct reasoning.
