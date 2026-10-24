**Definition:** a **skill** is a packaged, reusable set of **instructions, scripts and resources** that teaches an agent how to perform a specific task well (for example "create a PowerPoint", "review a pull request using our checklist", "follow the company brand guide"). It is a folder, typically with a **`SKILL.md`** file.

**Typical structure**

```text
pdf-report/
  SKILL.md            # YAML frontmatter (name, description) + instructions
  reference.md        # extra detail, loaded only when needed
  scripts/render.py   # code the agent can run
  templates/...
```

```markdown
---
name: pdf-report
description: Generate a formatted PDF report from data. Use when the user asks for a PDF, report or printable summary.
---
1. Load the data and validate columns.
2. Run scripts/render.py with the template ...
```

**Progressive disclosure (key idea)**

1. **Level 1, always loaded:** only each skill's **name and description** (a few dozen tokens) sit in the system prompt.
2. **Level 2, on trigger:** when a request matches, the agent reads the full `SKILL.md`.
3. **Level 3, on demand:** it opens extra files or runs scripts only if needed.

So you can install many skills without bloating context, and the agent loads expertise just in time.

**Skills vs other mechanisms**

| | Skill | Tool / MCP server | System prompt |
|---|---|---|---|
| What it is | Procedure and know-how (instructions + optional code) | Executable capability or data access | Always-on global instructions |
| Loaded | On demand | Definitions always present | Always |
| Best for | Repeatable workflows, formats, conventions | Calling APIs, reading systems | Persona and global rules |

They combine well: a skill describes **how and when** to use tools.

**Good practice:** write precise descriptions (they drive triggering), keep SKILL.md short and link to detail files, version and review skills, and treat third-party skills as code (scripts can execute), so only install trusted ones.
