**Idea:** an agent that operates a computer **like a person**: it sees the screen and uses the mouse and keyboard, so it can work with any GUI application, including those with no API.

**Perception-action loop**

```text
1. Take a screenshot of the screen (optionally plus accessibility tree / OCR text)
2. Send it with the goal and history to a vision-capable model
3. Model returns an action: click(x, y), type("text"), key("ctrl+s"), scroll, drag, wait, screenshot
4. A harness executes the action in the OS/VM
5. New screenshot -> repeat until the goal is done or a limit is reached
```

```python
while steps < MAX:
    shot = machine.screenshot()
    action = model(goal=goal, history=history, image=shot, tools=[computer_tool])
    if action.type == "done":
        break
    machine.execute(action)         # click/type/scroll in a sandboxed VM
    history.append(action)
```

**Key components:** a vision-language model trained for **GUI grounding** (mapping instructions to pixel coordinates), a harness providing screenshot/action tools, a **sandboxed VM or container** with a desktop, and loop controls.

**Strengths:** works with legacy and desktop software, cross-application workflows, no integration work.

**Limitations:** slow (one screenshot and model call per action), costly, brittle to UI changes and popups, coordinate errors, difficulty with small text, drag-and-drop and long workflows, and lower reliability than API integrations.

**Safety**

- Run in an **isolated VM** with minimal permissions; avoid exposing logged-in personal accounts and secrets.
- Screen content can contain **prompt injection** (text on a web page telling the agent to act).
- Require **human confirmation** for sensitive actions (purchases, sending messages, deleting), and restrict network access.
- Log screenshots and actions for audit; provide a stop button.

**Rule:** prefer APIs and structured tools when available; use computer use for tasks where only a GUI exists.
