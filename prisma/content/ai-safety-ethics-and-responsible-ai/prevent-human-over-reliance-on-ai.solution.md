**Problem:** **automation bias** (accepting automated suggestions even against evidence) and **automation complacency** turn "human in the loop" into a rubber stamp. 98% agreement does not show accuracy; measure **agreement when the AI is wrong**.

**Measure it**

- Seed **known-error cases** (calibration/"canary" cases with known ground truth) and measure catch rate; compare human-alone, AI-alone, and human+AI accuracy; track override rates, time per case, and reviewer calibration.

**Mitigations**

| Area | Practice |
|---|---|
| **Workflow** | **Independent first read:** clinician records their assessment before seeing the AI (or randomly hide AI for some cases); use AI as second reader/triage; double reading for flagged disagreements |
| **UX** | Show **calibrated confidence and uncertainty**, alternative hypotheses, evidence (heatmaps, regions), not just a verdict; avoid defaulting to AI suggestion; require a short rationale when accepting high-risk outputs; make disagreement easy |
| **Design** | Show the AI's known limitations and typical failure cases for this patient subgroup; cognitive forcing functions (pause, checklist); explanation only if shown to improve decisions (explanations can increase over-trust) |
| **Training** | Educate on error patterns, practise with AI-wrong cases, feedback on missed errors, periodic calibration exercises |
| **Operations** | Workload and time-pressure limits, rotate tasks, performance audits, escalation for disagreements, track drift of reviewer behaviour |
| **Governance** | Document oversight design (EU AI Act Art. 14 requires oversight that counters automation bias), accountability clarity, incident review of cases where humans deferred wrongly |

**Principle:** design for **complementarity**: the combined system should beat either alone, and you must prove it with data, not assume it.
