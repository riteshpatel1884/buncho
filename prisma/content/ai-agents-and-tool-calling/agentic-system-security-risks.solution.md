**Why agents raise the stakes:** they pair **untrusted content** (web pages, emails, tool outputs), **sensitive data** and **the ability to act**. This combination ("lethal trifecta") makes a single injection potentially damaging.

**Main risks**

| Risk | Example | Mitigation |
|---|---|---|
| **Prompt injection (direct and indirect)** | Hidden text in a web page tells the agent to email secrets | Treat all external content as data; isolate; filters; least privilege; approval for sensitive actions |
| **Excessive agency / over-permissioned tools** | Agent has admin DB access | Least privilege, scoped credentials, read-only by default |
| **Data exfiltration** | Rendering an image URL containing secrets; sending data to attacker domains | Egress allow-lists, no auto-loaded external links, DLP checks |
| **Confused deputy** | Agent uses its own broad rights for a low-privilege user | Pass the **end user's identity and permissions** to tools |
| **Tool and supply-chain attacks** | Malicious MCP server, poisoned tool description, compromised package | Vet servers, pin versions, sandbox, review descriptions |
| **Unsafe code execution** | Agent runs generated shell code | Sandboxes: no network, limited filesystem, resource limits |
| **Memory poisoning** | Attacker plants instructions in long-term memory | Validate writes, scope per user, allow review/deletion |
| **Insecure output handling** | Model output rendered as HTML or executed as SQL | Escape and validate, parameterised queries |
| **Denial of wallet / loops** | Token or tool-call explosion | Budgets, rate limits, step caps |
| **Multi-agent contagion** | One agent's output hijacks others | Authenticate and validate inter-agent messages |
| **Sensitive disclosure** | Agent leaks system prompt or other users' data | Don't put secrets in prompts; per-user data scoping; output filters |

**Defence in depth**

1. **Architecture:** minimise the capabilities that co-exist; separate readers of untrusted content from actors with powerful tools.
2. **Policy in code:** allow-lists, authorisation checks, schema validation, rate limits (never only a prompt instruction).
3. **Human approval** for irreversible or high-impact actions.
4. **Sandboxing and network controls.**
5. **Monitoring and audit:** log every tool call; alert on anomalies.
6. **Red teaming and evals** with injection and abuse test suites; incident response and kill switch.

**Mindset:** assume the model can be tricked and limit the blast radius.
