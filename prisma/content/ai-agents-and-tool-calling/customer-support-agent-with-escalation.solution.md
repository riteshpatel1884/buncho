**Architecture**

```text
message -> intent + sentiment + risk classifier -> router
  - FAQ / policy question  -> RAG answer with citations
  - account/order issue    -> agent with scoped tools (read first, write with limits)
  - sensitive/complex      -> immediate escalation
 -> response check (policy, groundedness) -> reply
 -> if escalate: create ticket + summary -> human queue
```

**Tools:** `get_order_status`, `get_return_policy`, `start_return` (WRITE, with limits), `reset_password_link`, `create_ticket`, `handoff_to_human`. Authenticate the customer first; tools enforce that users can access only their own data.

**Escalation triggers (combine rules and model signals)**

| Trigger | Example |
|---|---|
| **Customer request** | "I want to talk to a person" (always honour) |
| **Sentiment / frustration** | Strong negative sentiment, repeated rephrasing, ALL CAPS |
| **Risk category** | Legal threats, safety, fraud, chargebacks, data deletion, VIP accounts |
| **Policy limits** | Refund above threshold, exception requests |
| **Low confidence / no evidence** | Retrieval score below threshold; tool errors repeated |
| **Loop / no progress** | Same question 3 times, more than N turns without resolution |
| **Authentication problems** | Identity cannot be verified |

```python
def should_escalate(state):
    if state.user_asked_for_human: return "requested"
    if state.risk in {"legal", "fraud", "safety"}: return "risk"
    if state.sentiment < -0.6 and state.failed_attempts >= 1: return "frustrated"
    if state.tool_errors >= 2 or state.turns_without_progress >= 3: return "stuck"
    if state.refund_amount > POLICY.auto_refund_limit: return "policy"
    return None
```

**Handoff quality**

- Pass the **conversation, a short summary, the customer's goal, what was tried, tool results, sentiment, and suggested next action**, so the customer does not repeat themselves.
- Tell the customer what is happening and expected wait time; keep the chat open if possible; route by skill and priority.

**Metrics:** containment/resolution rate, correct-escalation rate (missed escalations are costly), unnecessary escalations, CSAT, handle time, refund accuracy, policy violations. Review escalated and thumbs-down conversations weekly, and expand automation only where metrics hold.
