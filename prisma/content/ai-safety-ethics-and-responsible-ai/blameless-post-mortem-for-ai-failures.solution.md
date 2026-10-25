**Blameless principle:** assume people acted reasonably with the information available; ask *how the system allowed the failure*, not *who failed*. This surfaces honest information and yields durable fixes.

**Process**

1. **Prepare (within days):** facilitator not directly involved, collect evidence (logs, traces, model/prompt/data versions, dashboards, tickets, chat transcripts), identify participants (ML, product, ops, domain experts, support, legal).
2. **Timeline:** when the change was deployed, when behaviour first diverged, detection time, response steps, customer impact (who, how many, severity), and decisions made with their rationale.
3. **Impact:** affected decisions, harm, financial/regulatory consequences; list remediation owed to users.
4. **Causal analysis ("5 whys", fishbone, fault tree)**, with **AI-specific factors**:
   - Data: drift, label errors, leakage, missing slices.
   - Model/prompt: regression after a change, provider update, threshold choice.
   - Evaluation gaps: metric did not capture this harm, no test for the scenario, stale golden set.
   - Monitoring: signal absent or alert ignored.
   - Human factors: automation bias, unclear escalation, UI hid uncertainty.
   - Process: no review gate, missing owner, pressure to ship.
5. **Contributing vs root causes:** usually several, no single "human error".
6. **What went well:** detection, communication, rollback speed.
7. **Action items:** specific, owned, dated and prioritised (preventive, detective, mitigating): add test cases and gates, monitoring/alerts, fallback to humans, UI changes, training, documentation, vendor changes. Track to completion.
8. **Share and learn:** publish a summary (internal, and external/regulatory where required), update the risk register and runbooks, follow up on action items, and run drills.

**Template headings:** summary, impact, timeline, root causes, detection/response, lessons, action items.
