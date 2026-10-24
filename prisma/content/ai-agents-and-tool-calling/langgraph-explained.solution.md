**What it is:** a low-level orchestration framework (from the LangChain team) for building **stateful, multi-step, possibly cyclic** LLM workflows and agents as **graphs**.

**Core model**

- **State:** a shared, typed object (TypedDict/Pydantic) that flows through the graph. Each key can have a **reducer** that defines how updates merge (append messages, overwrite, sum).
- **Nodes:** functions (an LLM call, a tool executor, any Python) that **read state and return updates**.
- **Edges:** transitions between nodes. **Conditional edges** choose the next node from the state (for example "tool call requested? go to tools, else end"). `START` and `END` mark entry and exit.
- **Cycles:** loops are first-class, which is what the agent loop (model -> tools -> model) needs, unlike DAG-only chains.

```python
from langgraph.graph import StateGraph, START, END, MessagesState
from langgraph.prebuilt import ToolNode, tools_condition

def call_model(state: MessagesState):
    return {"messages": [llm_with_tools.invoke(state["messages"])]}

g = StateGraph(MessagesState)
g.add_node("agent", call_model)
g.add_node("tools", ToolNode(tools))
g.add_edge(START, "agent")
g.add_conditional_edges("agent", tools_condition)     # -> "tools" or END
g.add_edge("tools", "agent")                          # loop back
app = g.compile(checkpointer=checkpointer)
```

**Key features**

- **Persistence / checkpointing:** state saved per `thread_id` after each step; enables **resume after failures, long pauses, memory across turns, and time travel** (replay or fork from a checkpoint).
- **Human-in-the-loop:** `interrupt()` pauses before sensitive nodes; resume with human input or edits.
- **Streaming** of tokens, node outputs and events.
- **Parallel branches and subgraphs** for multi-agent designs (supervisor, handoffs).
- **Observability** with LangSmith tracing.

**When to use it:** multi-step agents with branching, loops, approvals, long-running or resumable workflows, multi-agent coordination, and production needs for control and durability. For a single prompt or a short linear chain, plain LangChain (LCEL) or direct SDK calls are simpler.

**Trade-off:** more explicit design work (state schema, graph structure) in return for predictability and control over agent behaviour.
