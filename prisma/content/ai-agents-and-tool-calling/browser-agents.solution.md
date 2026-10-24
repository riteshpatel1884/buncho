**Definition:** agents that **navigate and operate web pages** to complete tasks (research, form filling, price comparison, booking, data extraction).

**Components**

1. **Browser automation layer:** a controllable browser (Playwright, Puppeteer, Chrome DevTools Protocol, browser extensions).
2. **Page representation (what the model sees)**
   - **DOM/HTML** (large and noisy; usually cleaned or truncated).
   - **Accessibility tree** (compact list of roles, names and states of interactive elements; widely used).
   - **Screenshots** with labelled **set-of-marks** (numbered boxes on clickable elements) for vision models.
   - Often a **hybrid**: simplified text plus screenshot.
3. **Action space:** `goto(url)`, `click(element)`, `type(element, text)`, `select`, `scroll`, `press`, `extract`, `wait`, tab management, file upload.
4. **Planner/loop:** the model reads the observation, chooses an action, the harness executes and returns the new page state.

```python
page = await browser.new_page()
await page.goto(url)
for _ in range(20):
    obs = await snapshot(page)                    # accessibility tree + element ids
    action = llm(goal=goal, observation=obs, history=history)
    if action.kind == "finish":
        return action.result
    await execute(page, action)                   # click(id=17), type(id=4, "Pune"), ...
```

**Versus computer-use agents:** browser agents use **structured page data** (DOM/accessibility tree), which is faster, cheaper and more precise than pixels alone, but limited to the browser. Computer-use agents operate the whole desktop through screenshots.

**Challenges:** dynamic content and SPAs, popups, CAPTCHAs and bot detection, login/session handling, long flows, and flaky selectors.

**Security (critical)**

- **Indirect prompt injection:** any page text can try to instruct the agent; treat web content as untrusted data.
- Isolate the browser profile (no personal logins), allow-list domains where possible, and require **user confirmation** for purchases, posting, sharing data.
- Block exfiltration paths, log actions, and set step limits.

**Prefer APIs** when they exist; use browser agents where only the web UI is available.
