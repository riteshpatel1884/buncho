**They operate at different layers and are complementary, not alternatives.**

- **Function calling** is a **model/API capability:** you pass tool definitions with a request, and the model emits structured calls. How the tools are implemented, discovered or hosted is up to your app.
- **MCP** is a **protocol for connecting applications to tools and data:** it standardises **how tools are described, discovered, authenticated and executed** across apps and servers. MCP clients typically translate MCP tool definitions into the model's function-calling format, and run the call on the MCP server.

```text
Your app (host) --MCP--> MCP server (GitHub, DB, files)
      |  tool definitions from MCP -> sent to the LLM as function-calling tools
      v
   LLM emits tool_call -> app routes it over MCP to the server -> result back to LLM
```

| | Function calling | MCP |
|---|---|---|
| Layer | Model API feature | Integration protocol (client/server) |
| Tool definition | Written in your app for each request | Served by the MCP server, discovered dynamically |
| Reuse across apps | Re-implement per app | One server works with any MCP client |
| Execution | Your code, in your process | Server process (local or remote), over JSON-RPC |
| Extras | None | Resources, prompts, auth, capability negotiation |
| Overhead | Minimal | Extra process or network hop |

**Use plain function calling** for a few app-specific, tightly integrated tools (simplest and fastest). **Use MCP** when tools should be shared across multiple apps or agents, when you want to use third-party servers, or when tools are owned by other teams and should be discoverable and versioned independently.

Both need the same safeguards: validate arguments, least privilege, approval for side effects, and distrust of tool output.
