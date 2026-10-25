**Layered provenance (no single method is enough)**

| Layer | How it works | Strength | Weakness |
|---|---|---|---|
| **Signed metadata: C2PA Content Credentials** | Cryptographically signed manifest (generator, model, time, edits) embedded in the file or stored in a registry | Verifiable, interoperable, human-readable | Stripped by screenshots or re-encoding |
| **Invisible watermark** | Imperceptible signal embedded in pixels/frequency domain, or learned into generation (Google SynthID, Stable Signature, Tree-Ring for diffusion noise) | Survives many edits; machine-detectable | Can be degraded by strong edits, regeneration attacks, removal with knowledge of the scheme |
| **Visible label** | Badge or caption on the image | Immediate transparency | Easily cropped |
| **Fingerprinting/registry** | Store perceptual hashes of everything generated | Lookup even if the watermark is lost | Needs central database; privacy concerns |
| **Detection classifiers** | Detect generation artefacts | Works on unmarked content | Unreliable, falsely accuses, arms race |

**Implementation steps**

1. Embed the watermark **at generation** (latent/frequency domain) with a key; sign a C2PA manifest on export.
2. Offer a **verification endpoint/tool** and publish detector APIs for platforms and newsrooms.
3. **Test robustness:** JPEG compression, resize, crop, screenshots, filters, regeneration/diffusion purification; measure detection TPR at fixed FPR.
4. Combine with **policy and abuse controls**: refuse realistic fakes of real events/people (election, crisis imagery), public-figure and likeness limits, prompt/output classifiers, rate limits, account verification.
5. Platform partnership: encourage social platforms to read credentials and label.
6. **Compliance:** EU AI Act Art. 50 requires machine-readable marking of synthetic content; China and several US states have labelling rules.

**Be honest about limits:** watermarks prove origin only for *your* content; absence does not prove authenticity. Pair with media literacy, fact-checking and takedown procedures.
