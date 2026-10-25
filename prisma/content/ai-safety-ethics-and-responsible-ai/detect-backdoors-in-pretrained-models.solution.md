**Two separate risks**

1. **Malicious artefact:** pickle-based files (`.pt`, `.pkl`, joblib) can execute **arbitrary code** on load.
2. **Behavioural backdoor / trojan:** the model works normally except when a **trigger** (pixel patch, rare token, phrase, system-prompt pattern) appears, causing attacker-chosen output (also "sleeper agents" in LLMs).

**Supply-chain controls (do first)**

- Prefer **safetensors**; scan with ModelScan/picklescan/Protect AI; never `torch.load` untrusted files without `weights_only=True`; load in a sandbox (no network, minimal permissions).
- Verify **provenance**: publisher identity, signatures (Sigstore), hashes, repo history, model card, community reports, licence; pin to a commit hash; mirror internally.
- Check custom code (`trust_remote_code`) by reading it.

**Behavioural detection**

| Method | Idea |
|---|---|
| **Neural Cleanse / trigger reverse-engineering** | For each class, find the smallest perturbation that flips inputs to it; an abnormally small one signals a backdoor |
| **Activation clustering / spectral signatures** | Poisoned samples form separate clusters in hidden activations |
| **STRIP / input-perturbation tests** | Backdoored inputs keep predictions despite blending with other images (low entropy) |
| **Weight analysis** | Compare to a known-clean base model; fine-pruning (prune neurons dormant on clean data); weight-diff and anomaly scans |
| **LLM tests** | Probe with candidate triggers, differential testing against a trusted model, red-team prompts across contexts (dates, deployment tags), trigger-inversion research methods, interpretability (probes, SAE features) |
| **Data-free checks** | Compare outputs across many diverse inputs for anomalies |

**Mitigate if uncertain:** fine-tune on trusted data, prune/distil into a fresh model, input filtering, runtime monitoring, limit model privileges (no tools or sensitive data access), and prefer reputable sources or train your own.

**Caveat:** absence of detection is not proof; apply **defence in depth** and risk-based approval for third-party models.
