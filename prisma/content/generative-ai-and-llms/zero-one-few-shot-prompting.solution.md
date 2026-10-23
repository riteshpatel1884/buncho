All three are **in-context learning**: the model infers the task from the prompt, with no weight updates.

**Zero-shot:** instruction only.

```text
Classify the sentiment as positive, negative or neutral.
Review: "The battery died in two days."
Sentiment:
```

**One-shot:** one worked example.

```text
Review: "Fast delivery and great quality." -> positive
Review: "The battery died in two days." ->
```

**Few-shot:** several examples (typically 2 to 8), ideally covering each label and edge cases.

```text
"Fast delivery and great quality." -> positive
"It works. Nothing special." -> neutral
"Broke after a week, support ignored me." -> negative
"The battery died in two days." ->
```

| | Zero-shot | One-shot | Few-shot |
|---|---|---|---|
| Tokens / cost | Lowest | Low | Higher |
| Format control | Weak | Fair | Strong |
| Best when | Task is common and clear, strong model | Format needs a demo | Custom labels, subtle style, structured output |

**Tips**

- Examples teach **format and label space** as much as the task; keep them consistent.
- Choose diverse, representative examples; balance labels; put the most relevant examples last or retrieve them dynamically (kNN example selection).
- If few-shot is not enough, consider fine-tuning.
