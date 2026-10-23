**Definition:** telling the model to adopt a role or perspective ("You are a senior security reviewer", "Explain as a patient teacher to a 12-year-old").

**When it helps**

- **Tone, style and audience:** formal vs friendly, level of detail, vocabulary.
- **Focus and framing:** a "security auditor" notices different issues than a "performance engineer".
- **Consistency in customer-facing bots:** brand voice and boundaries.
- **Perspective-taking:** simulate a reviewer, critic, interviewer, or a user persona for testing.
- **Multi-role workflows:** separate writer and critic roles in a chain.

**Where it helps less**

- It does **not add knowledge or reasoning ability**. "You are a world-class mathematician" has little or no measured effect on accuracy for modern strong models.
- Over-the-top personas can cause roleplay behaviour, flattery, or invented credentials.

**Writing a good role prompt:** be specific about *expertise, audience, goals and constraints*, not just a title.

```text
You are a senior backend engineer reviewing a pull request for a payments service.
Focus on correctness, security and failure handling. Be direct and specific.
List issues by severity; for each, quote the code and suggest a fix. Do not comment on style.
```

**Best practice:** combine a role with a clear task, format and constraints; test whether the role improves your metric rather than assuming it does.
