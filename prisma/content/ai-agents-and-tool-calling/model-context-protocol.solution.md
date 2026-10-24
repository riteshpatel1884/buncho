**Problem:** every AI app (chat client, IDE, agent) integrated with every data source or tool using custom code, an **M x N** integration problem with duplicated effort.

**MCP (Anthropic, open standard, 2024):** a protocol so any MCP **client** can use any MCP **server**, turning M x N into **M + N**. Often compared to "USB-C for AI tools".

**Architecture**

- **Host:** the AI application (Claude Desktop, an IDE, your agent).
- **Client:** a connector inside the host that keeps a 1:1 connection to a server.
- **Server:** a program that exposes capabilities for a system (GitHub, a database, files, Slack).
- **Transport:** JSON-RPC 2.0 over stdio (local processes) or HTTP (remote servers, with streaming).

**What servers expose (primitives)**

| Primitive | Controlled by | Purpose |
|---|---|---|
| **Tools** | The model | Functions with JSON schemas that can act (search, create issue) |
| **Resources** | The application | Readable data (files, records, docs) added as context |
| **Prompts** | The user | Reusable prompt templates and workflows |
| (Client features) | | Sampling, roots, elicitation |

```python
from mcp.server.fastmcp import FastMCP
mcp = FastMCP("orders")

@mcp.tool()
def get_order_status(order_id: str) -> dict:
    """READ-ONLY. Return status and tracking for an order id."""
    return lookup(order_id)

mcp.run()      # any MCP client can now discover and call get_order_status
```

**Flow:** client connects, **discovers** tools/resources, passes tool definitions to the model, executes the model's tool calls on the server, and returns results.

**Benefits:** reuse, ecosystem of ready-made servers, dynamic discovery, consistent auth patterns (OAuth for remote servers), separation of concerns.

**Risks:** untrusted or malicious servers, **tool poisoning** (instructions hidden in descriptions), prompt injection via results, over-broad permissions, supply-chain issues. Use trusted servers, least-privilege credentials, human approval for sensitive tools, and monitoring.
