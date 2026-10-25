| | **PTQ** (post-training) | **QAT** (quantization-aware training) |
|---|---|---|
| When | After training, using the finished model | During (or fine-tuning with) training |
| Needs | Small **calibration set** (hundreds of samples), minutes to hours | Training data and substantial compute |
| How | Choose scales/clip ranges (min-max, percentile, MSE); GPTQ minimises layer-wise reconstruction error, AWQ protects salient weights | **Fake quantization** in the forward pass, gradients via the **straight-through estimator**, so weights adapt to rounding |
| Quality | Good at 8-bit and 4-bit weight-only; degrades below that | Best at low bits; can recover most lost accuracy |
| Cost | Cheap | Expensive for LLMs (often approximated by QLoRA-style fine-tuning) |

**What breaks at 2 to 4 bits**

1. **Rounding error grows:** 4 bits give 16 levels, 2 bits only 4; the quantisation step is large relative to weight differences.
2. **Outliers:** a few weights and especially **activation channels** have huge magnitude; one outlier forces a large scale, squashing all normal values into few levels. LLMs (beyond a few billion parameters) show systematic outlier features.
3. **Error accumulation** over dozens of layers and over long generations.
4. **Sensitive layers:** embeddings, first/last layers, `lm_head`, attention output and down-projections degrade more.
5. **KV cache and activations** are harder to quantise than weights.
6. **Small models** are less redundant and lose more than large ones.
7. Metrics hide it: perplexity may move slightly while **reasoning, long-context, multilingual and code** abilities drop more.

**Mitigations**

- **Group-wise quantisation** (e.g. group size 64/128) and asymmetric scales.
- **Mixed precision:** keep sensitive layers or salient channels at higher precision.
- **Outlier handling:** SmoothQuant, rotation methods (QuaRot/SpinQuant, Hadamard transforms) that spread outliers, AWQ scaling.
- **Better rounding:** GPTQ (second-order), learned rounding (AdaRound/OmniQuant), vector/codebook quantisation (AQLM, QuIP#) for 2-3 bits.
- **QAT or QLoRA-style recovery fine-tuning** after PTQ.
- Choose calibration data resembling real usage.

**Rule:** FP8/INT8 are near-lossless; 4-bit weight-only is usually fine for large models; below 4 bits requires specialised methods and careful evaluation.
