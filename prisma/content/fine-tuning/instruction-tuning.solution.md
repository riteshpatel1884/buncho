**Instruction tuning** is supervised fine-tuning on `(instruction, input, output)` examples written in natural language across **many tasks**, so the model learns to **follow instructions** rather than just continue text.

**Why needed:** a base model trained on next-token prediction may answer "What is the capital of France?" with more questions (continuing a quiz), not an answer. Instruction tuning teaches the **interaction pattern**: user asks, assistant responds helpfully, then stops.

**Data**

- Human-written (FLAN, Dolly), human + model collaboration (InstructGPT demonstrations), or **synthetic** (Self-Instruct, Alpaca, Evol-Instruct, distilled from stronger models).
- Needs diversity of tasks, formats, lengths and difficulty\; includes system prompts and multi-turn chats in a **chat template** (special tokens for roles).

```python
messages = [{"role": "system", "content": "You are concise."},
            {"role": "user", "content": "Summarise: ..."},
            {"role": "assistant", "content": "..."}]
text = tokenizer.apply_chat_template(messages, tokenize=False)   # use the model's own template
```

**Key findings:** a small set of **high-quality, diverse** examples (LIMA: about 1,000) can unlock instruction following since knowledge comes from pre-training\; instruction tuning on many tasks (FLAN) improves **zero-shot generalisation** to unseen tasks.

**Limits:** teaches style and format more than new knowledge\; can hallucinate confidently\; does not by itself ensure safety or preference alignment (hence RLHF/DPO)\; wrong chat template at inference degrades results.
