You have lists `texts` and `labels` and a tokenizer that returns a list of token ids per text.

Write a `Dataset` that tokenises lazily and a `collate_fn` that pads each batch to its longest sequence and returns `input_ids`, `attention_mask` and `labels`. Then create a `DataLoader` and explain the main performance settings.
