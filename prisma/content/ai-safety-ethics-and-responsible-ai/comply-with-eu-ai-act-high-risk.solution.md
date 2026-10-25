**1. Classify.** Check Annex III use cases (employment, credit, education, essential services, law enforcement, etc.) and safety-component rules for regulated products. Note exceptions (narrow procedural or preparatory tasks) and document the reasoning. Determine your role: **provider**, deployer, importer, distributor.

**2. Gap assessment** against Articles 9-15:

| Requirement | Implementation |
|---|---|
| **Risk management (Art. 9)** | Continuous process: hazards, foreseeable misuse, residual risk, tests; living risk register |
| **Data governance (Art. 10)** | Document sources, labelling, representativeness, bias examination and mitigation |
| **Technical documentation (Art. 11)** | Design, training, metrics, limits; model cards and system cards |
| **Logging (Art. 12)** | Automatic event logs for traceability, retention policy |
| **Transparency (Art. 13)** | Instructions for deployers: capabilities, accuracy, limits |
| **Human oversight (Art. 14)** | Override, stop button, review UI, automation-bias safeguards |
| **Accuracy, robustness, cybersecurity (Art. 15)** | Declared metrics, adversarial and drift testing, security controls |

**3. Quality management system** (Art. 17): change control, testing, roles, incident handling, supplier management (consider ISO/IEC 42001).

**4. Conformity assessment:** internal control for most Annex III systems (notified body for some biometrics/regulated products); draw up the **EU declaration of conformity**, affix **CE marking**, **register** in the EU database.

**5. Post-market:** monitoring plan, performance and drift tracking, **serious-incident reporting** to authorities, corrective actions, and updates when modified (substantial modification triggers reassessment).

**6. Organise:** assign an owner, train staff (AI literacy), engage legal/DPO, align with GDPR DPIA, write deployer-facing documentation, and check that GPAI vendors give you needed documentation.

**Practical approach:** compliance-as-code: automated bias and robustness tests in CI, versioned artefacts, and evidence bundle generation per release.
