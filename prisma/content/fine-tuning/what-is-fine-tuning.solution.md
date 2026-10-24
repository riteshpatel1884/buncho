**Definition:** fine-tuning continues training a **pretrained** model on a smaller, task-specific dataset so its **weights** change to fit your behaviour, style, format or domain.

**How it works**

1. Start from a pretrained (usually instruction-tuned) model.
2. Build examples: `(prompt, ideal response)` pairs.
3. Run gradient descent with the **same next-token cross-entropy loss**, usually computed only on the **response tokens** (prompt tokens are masked).
4. Use a **small learning rate** (e.g. 1e-5 to 2e-4 depending on method) for a few epochs, so the model adapts without erasing what it knows.
5. Evaluate on held-out data, then deploy the new weights or adapter.

```python
# loss masking: only the answer contributes
labels = input_ids.clone()
labels[:prompt_len] = -100          # ignored by CrossEntropyLoss
loss = model(input_ids=input_ids, labels=labels).loss
```

**Fine-tune when**

- You need a consistent **style, tone, or output format** that prompting cannot hold reliably.
- A narrow task needs **higher accuracy** than prompting reaches (classification, extraction, tool-call formatting, domain jargon).
- You want a **smaller, cheaper, faster** model to match a large one on a specific task (distil a big model's outputs).
- Prompts are long and repeated on every call: baking behaviour into weights cuts tokens and latency.
- **Latency/privacy:** run a small tuned model on your own infrastructure.

**Do not fine-tune when**

- The need is **fresh or changing knowledge** or citations: use **RAG** (weights are a poor, hard-to-update fact store).
- You have not yet tried **better prompts, few-shot examples and evaluation**\; they are cheaper and reversible.
- You have little or low-quality data, or no way to measure success.

**Order of attack:** prompt engineering, then RAG/tools, then fine-tuning (often combined with them).
