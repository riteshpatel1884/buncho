## What a stop token is

A **stop token** is a special vocabulary item that signals the end of a generation. Examples: `<|endoftext|>` (GPT-2), `</s>` or `<eos>` (many open models), `<|im_end|>` (ChatML), `<|eot_id|>` (Llama 3 end of turn).

## How the model learns to stop

Stopping is **learned, not hard-coded**.

- During pre-training and fine-tuning, each training sequence (or each assistant message) is **followed by an end token**, and the loss includes predicting it.
- So at the end of a complete answer, the model assigns a **high probability** to the end token. When sampling picks that token, the generation is finished.
- Chat models are trained with a **chat template** that wraps every turn in role and end-of-turn tokens, so they learn "after the assistant's answer comes end-of-turn".

## How the serving engine uses it

Each decode step the engine does the following:

1. Sample the next token ID.
2. If the ID is in the **set of stop IDs** (the model's EOS and end-of-turn tokens, which can be more than one), stop and do not return that token to the user.
3. Otherwise append the token and continue.
4. A **`max_tokens`** (or remaining context) limit is a hard backstop in case the model never emits a stop token.

Other stop conditions: user-provided stop sequences, a cancelled request, or a safety stop.

## What goes wrong

| Symptom | Likely cause |
|---|---|
| Model rambles or continues a fake dialogue (writes the "User:" turn too) | Wrong or missing chat template; stop token not configured |
| Never stops, repeats until max tokens | Base (non-instruct) model, fine-tuning data without end tokens, or repetition loop |
| Stops too early | Premature end-token probability, a too-low `max_tokens`, or a stop sequence that appears in valid output |
| Fine-tuned model ignores stopping | The EOS token was not appended or was masked out of the loss in the training data |

## Practical advice

- Use the tokenizer's official chat template, and make sure `eos_token_id` covers **all** end tokens the model uses (for example both `<|eot_id|>` and `<|end_of_text|>` for Llama 3).
- When fine-tuning, **append the EOS token** to every example and keep it in the loss.
- Always set `max_tokens` for cost control.
- Output length is partly a stop-token behaviour: a model that emits EOS earlier produces shorter answers.
