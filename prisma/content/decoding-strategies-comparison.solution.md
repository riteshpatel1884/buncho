## Short answer

Decoding strategies trade **determinism and likelihood** against **diversity**. Greedy and beam search chase high-probability sequences, so they suit tasks with one right answer. Sampling methods (temperature, top-k, top-p) add controlled randomness, so they suit open-ended generation.

## Comparison

| Method | How it works | Deterministic | Good for | Fails when |
|---|---|---|---|---|
| **Greedy** | Pick the most probable token every step | Yes | Extraction, classification, short factual answers | Repetition loops, bland text, one early locally-best choice locks in a poor sequence |
| **Beam search** | Keep the $$B$$ best partial sequences by total log-probability | Yes | Translation, summarisation, speech recognition | Open-ended text becomes generic and repetitive; favours short outputs unless length-normalised; $$B\times$$ compute and memory |
| **Temperature** | Rescale logits, then sample | No (except $$T\to0$$) | Tuning diversity | High $$T$$ without truncation lets rare tokens derail long outputs; low $$T$$ approaches greedy |
| **Top-k** | Sample from the $$k$$ most likely tokens | No | Simple, cheap truncation | Fixed $$k$$ is too wide when the model is confident and too narrow when many options are valid |
| **Top-p** | Sample from the smallest set reaching cumulative probability $$p$$ | No | Open-ended text with varying confidence | $$p$$ too high admits tail noise; too low behaves like greedy |

## Why maximum likelihood is not "best" for open text

Holtzman et al. (2019, *The Curious Case of Neural Text Degeneration*) showed that the highest-probability continuations of open-ended prompts are often dull and repetitive, while human text contains many lower-probability choices. That is the reason sampling with truncation is the default for chat and creative generation.

## Practical combinations

- **Structured extraction, code, classification:** temperature 0 (or very low), no truncation needed, validate the output format.
- **Creative writing, brainstorming:** temperature around 0.8 to 1.0 with top-p around 0.9 to 0.95.
- **Translation or summarisation with an older seq2seq model:** beam search (small beam, length normalisation).

These are starting points; confirm them with your own evaluation set.

## Engineering notes

- Production LLM APIs mostly expose temperature and top-p (sometimes top-k) and rarely beam search, because beam search is costly and behaves poorly for open-ended chat.
- Temperature 0 does not always guarantee bit-identical output across runs.
- Repetition and frequency penalties are separate controls that discourage loops.

## Interview follow-up

*"Your sampled summaries sometimes contain facts not in the source. What would you change?"* Lower temperature and truncation, constrain the prompt to the source, and add a faithfulness check. Lower randomness reduces variance, but it does not remove hallucination by itself.
