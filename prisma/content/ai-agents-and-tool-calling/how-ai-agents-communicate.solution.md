**Communication patterns**

| Pattern | How | Good for | Watch out |
|---|---|---|---|
| **Direct message passing** | Agent A sends a message (text or structured) to B | Pipelines, hand-offs | Context lost in summaries |
| **Orchestrator relay** | All messages go through a supervisor | Control, auditing | Bottleneck, supervisor errors |
| **Shared state / blackboard** | Agents read and write a common state object or store | Collaboration on one artifact | Race conditions, conflicting writes |
| **Shared files / artifacts** | Agents write outputs to files, pass references | Large outputs, long tasks | Versioning, permissions |
| **Event bus / queue** | Agents publish and subscribe to events | Asynchronous, scalable systems | Debugging, ordering |
| **Handoff** | Control transfers to another agent with context | Routing to specialists | What context travels |

**Message design:** use **typed, structured messages** (task, inputs, constraints, expected output schema, deadline, provenance) rather than free text where possible; include identifiers for tracing.

```python
handoff = {
    "from": "triage", "to": "billing",
    "goal": "Resolve refund request for order 8841",
    "facts": {"customer_id": "C-17", "order_id": "8841", "amount": 59.0},
    "already_tried": ["checked order status"],
    "expected_output": {"decision": "refund|deny", "reason": "str"},
}
```

**Protocols and standards**

- **Agent-to-tool:** function calling, and **MCP** (Model Context Protocol) for tools, resources and prompts.
- **Agent-to-agent:** emerging standards such as **A2A (Agent2Agent)** for discovery (agent cards), tasks and messages across vendors and frameworks; framework-internal mechanisms (LangGraph state, AutoGen/CrewAI messaging, OpenAI/Claude SDK handoffs).

**Considerations:** authentication and authorisation between agents, schema versioning, injection through inter-agent messages (treat them as untrusted input), loops (agents replying forever), cost of long shared histories, and observability with trace ids across agents.
