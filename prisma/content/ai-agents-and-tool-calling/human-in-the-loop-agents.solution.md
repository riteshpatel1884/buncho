**Definition:** a design where a **human reviews, approves, corrects or takes over** at defined points in an agent's workflow.

**Forms**

| Form | Description | Use |
|---|---|---|
| **Approval gate** | Agent proposes an action; human approves or rejects | Sends email, payments, deletes, deployments |
| **Review and edit** | Human edits a draft before it is used | Customer replies, legal text |
| **Clarification** | Agent asks when requirements are ambiguous | Missing parameters, conflicting goals |
| **Escalation / handoff** | Agent transfers the case to a human | Low confidence, sensitive topics, repeated failure |
| **Human-on-the-loop** | Human monitors dashboards and can intervene or stop | Autonomous agents with audit and kill switch |
| **Feedback for learning** | Human corrections feed evals and training | Continuous improvement |

**When it is needed**

- **Irreversible or high-impact actions** (money, deletion, external communication, production changes).
- **High-stakes or regulated domains** (health, finance, legal).
- **Low model confidence** or conflicting evidence.
- **New or untrusted contexts**, early in a rollout when trust is not yet established.
- Anything involving **sensitive data access**.

**Implementation**

```python
def execute(action):
    risk = policy.risk(action)              # based on tool, amount, target, reversibility
    if risk == "low":
        return run(action)
    approval = request_approval(summary=action.explain(), diff=action.preview(), timeout="1h")
    if approval.approved:
        return run(approval.edited_action or action)
    return {"status": "rejected", "reason": approval.reason}
```

- Pause with **persisted state** (checkpoint) so the workflow resumes after hours or days (for example LangGraph interrupts).
- Show **clear previews** (what will change, to whom, why), evidence and an undo option.
- **Risk-based tiers** so low-risk actions run automatically and humans see only what matters (avoid approval fatigue).
- Timeouts and defaults (deny after timeout), audit logs, and approver authentication.
- Measure approval rate: if humans approve 99.9% of a gate's requests, consider relaxing it; if they reject often, fix the agent.
