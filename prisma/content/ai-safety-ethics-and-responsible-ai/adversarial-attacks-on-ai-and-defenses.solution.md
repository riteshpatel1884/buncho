**Attack taxonomy**

| Attack | What it does | Example |
|---|---|---|
| **Evasion (adversarial examples)** | Small crafted input changes flip predictions at inference | Imperceptible pixel noise, adversarial patch on a stop sign, malware obfuscation |
| **Poisoning / backdoors** | Corrupt training data to degrade or implant triggers | Trigger pattern causes misclassification |
| **Model extraction/stealing** | Query the API to clone the model | Distillation from outputs |
| **Membership inference** | Decide whether a record was in training data | Privacy leak |
| **Model inversion / training-data extraction** | Reconstruct data from model | Memorised PII from LLM |
| **LLM-specific** | Jailbreaks, prompt injection, data exfiltration, tool abuse, resource exhaustion | "Ignore previous instructions" in a web page |

**Attacker knowledge:** white-box (gradients, e.g. FGSM, PGD), black-box (query-based, transfer attacks).

**Defences (layered)**

- **Robust training:** adversarial training, data augmentation, randomised smoothing (certified robustness), ensembles.
- **Input defences:** validation, sanitisation, anomaly/out-of-distribution detection, preprocessing (re-encode, denoise).
- **Output/API controls:** rate limits, query monitoring for extraction patterns, rounding or limiting confidence scores, authentication, watermarking.
- **Privacy:** differential privacy, deduplication, regularisation vs memorisation.
- **Supply chain:** verified datasets/models, signatures, scanning.
- **LLM systems:** guardrails, least-privilege tools, treat retrieved content as untrusted, human approval for risky actions, red teaming.
- **Operations:** monitoring, incident response, regular adversarial testing, patch cycles.

No single defence is complete: assume attackers adapt, use **defence in depth**, and measure robustness under adaptive attacks.
