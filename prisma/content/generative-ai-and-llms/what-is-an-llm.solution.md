## What it is

An LLM is a neural network, almost always a **decoder-only Transformer** with billions of parameters, trained to model the probability of text. Given a sequence of tokens it outputs a probability distribution over the **next token**.

$$P(x_1,\dots,x_n)=\prod_{t=1}^{n}P(x_t\mid x_1,\dots,x_{t-1})$$

This is the **autoregressive** factorisation: a whole sequence is generated one token at a time, each conditioned on everything before it.

## How it is trained

1. **Pre-training (self-supervised).** Text is split into tokens. For every position the model predicts the next token and is penalised with **cross-entropy loss**, $-\log P(x_t\mid x_{<t})$. No human labels are needed because the text supplies its own targets. Training runs on trillions of tokens, which is where world knowledge and language ability come from.
2. **Supervised fine-tuning (SFT).** The base model is trained on curated instruction and response pairs so it follows instructions instead of just continuing text.
3. **Preference tuning (RLHF, DPO, RLAIF, RL with verifiable rewards).** The model is optimised toward answers humans (or verifiers) prefer: helpful, harmless, correct.

## How it runs (inference)

1. Text is tokenised into integer IDs.
2. IDs are embedded and passed through a stack of Transformer blocks (self-attention + feed-forward).
3. The final hidden state at the last position is projected to **logits** over the vocabulary, and softmax turns them into probabilities.
4. A **decoding strategy** picks a token (greedy, temperature, top-k, top-p).
5. The token is appended and the loop repeats until an end-of-sequence token or a length limit. A **KV cache** avoids recomputing earlier positions.

## Why it works, and where it breaks

- Predicting the next token well across diverse text forces the model to learn grammar, facts, reasoning patterns and code. Scale (parameters, data, compute) improves this predictably (scaling laws).
- **In-context learning:** the model can pick up a task from examples in the prompt without weight updates.
- **Limits:** it optimises plausibility, not truth, so it can **hallucinate**; knowledge stops at the training cutoff; the **context window** is finite; outputs are stochastic.
