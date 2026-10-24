**Symptoms:** training loss near zero, validation loss rising, outputs copying training examples (including private text), poor performance on paraphrased or new inputs.

**Diagnose**

- Plot **train vs validation loss**; compute **exact/near-duplicate overlap** between outputs and training data (n-gram overlap).
- Check **duplicates** in the data (repeated examples are memorised far faster), data size relative to model/rank, epochs, learning rate.
- Test **train/test leakage** (a clean split by document or customer).

**Fixes (most effective first)**

1. **Data:** deduplicate (exact and fuzzy); add more **diverse** examples; paraphrase/augment inputs; remove sensitive or unique strings (PII, secrets) before training.
2. **Train less:** fewer epochs (often 1 to 2), **early stopping** on validation loss, **lower learning rate**, keep the best checkpoint.
3. **Reduce capacity:** smaller LoRA rank, fewer target modules, or use LoRA instead of full fine-tuning.
4. **Regularise:** LoRA dropout (0.05 to 0.1), weight decay, label smoothing, mix in **general data** (replay).
5. **Larger/regularised batches**, noise or NEFTune embedding noise.
6. **Privacy:** differentially private training (DP-SGD) if memorisation of sensitive data is a legal risk; avoid training on secrets at all.
7. **Output controls:** n-gram/overlap filters, PII scrubbing, and lower-risk decoding (do not rely on these alone).

```python
# early stopping with the best checkpoint
TrainingArguments(num_train_epochs=3, eval_strategy="steps", eval_steps=50,
                  save_strategy="steps", save_steps=50, load_best_model_at_end=True,
                  metric_for_best_model="eval_loss", learning_rate=1e-4)
```

**Verify:** held-out set metrics improve; extraction attacks (prompt with the first words of training examples) no longer reproduce them; the model handles paraphrases.
