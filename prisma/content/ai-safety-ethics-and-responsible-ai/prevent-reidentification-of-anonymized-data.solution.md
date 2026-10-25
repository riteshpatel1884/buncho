**Why removing names fails:** **quasi-identifiers** (ZIP, birth date, gender, timestamps, device, location traces, rare diagnoses) combine to be unique. Sweeney showed 87% of Americans are identifiable by ZIP + birth date + sex; Netflix Prize and AOL data sets were re-identified via **linkage with auxiliary data**.

**Assess risk first**

- Measure **uniqueness / k-anonymity** over quasi-identifiers, run **linkage attacks** against plausible external datasets (red-team the release), and test membership inference.

**Mitigations (layered)**

| Technique | Idea | Note |
|---|---|---|
| **Generalise/suppress** | Age bands, 3-digit ZIP, round timestamps, drop rare categories | Reduces utility |
| **k-anonymity** | Each record indistinguishable from at least k-1 others | Vulnerable to homogeneity and background knowledge |
| **l-diversity / t-closeness** | Sensitive attribute diverse within each group | Improves on k-anonymity |
| **Differential privacy** | Add calibrated noise to queries or training; provable bound | Preferred for statistics and ML; utility cost |
| **Synthetic data (with DP)** | Generate data resembling the original | Not automatically private; test leakage |
| **Pseudonymisation + key separation** | Tokens with keys held separately | Still personal data under GDPR |
| **Aggregation and k-thresholds** | Publish only aggregates with minimum counts | |
| **Access controls instead of release** | Secure enclaves, query interfaces with privacy budgets, data-use agreements | Best for sensitive data |

**Governance:** data minimisation, release only what is needed, legal agreements prohibiting re-identification, **expert determination** (HIPAA) or Safe Harbor, regular re-assessment as external datasets grow, incident response and notification if re-identification occurs.

**For LLMs:** scrub PII before training, deduplicate, test for memorisation and extraction, and avoid logging raw prompts.
