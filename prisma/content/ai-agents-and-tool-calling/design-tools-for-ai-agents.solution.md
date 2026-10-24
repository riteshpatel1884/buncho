**Principles**

1. **Design for the agent, not just for developers.** A tool is a contract between a deterministic system and a non-deterministic caller.
2. **Few, purposeful tools.** Prefer `find_customer(query)` and `get_customer_timeline(id)` over mirroring 60 raw API endpoints; combine steps that are always done together.
3. **Distinct, non-overlapping responsibilities** and clear names (`search_tickets`, not `search` or `find`).
4. **Descriptions say when and when not to use it:** purpose, inputs, what it returns, whether it is read-only or has side effects, and boundaries ("do not use for billing questions").
5. **Strict, simple schemas:** typed fields, enums for fixed choices, formats and examples, required vs optional, sensible defaults, no free-form blobs.
6. **Return agent-friendly output:** concise, relevant fields, human-readable names instead of opaque ids where possible, pagination and truncation with a hint ("showing 10 of 240; refine with `status`").
7. **Helpful errors:** explain what was wrong and how to fix it (`"order_id must be 8 digits, got 'A12'. Use find_order to look it up."`), and make "not found" explicit.
8. **Safety in the tool itself:** authorisation, input validation, idempotency keys, dry-run mode, confirmation for destructive actions, rate limits, audit logs. Never rely on the prompt alone.
9. **Separate read and write tools;** least privilege per agent.

```json
{
  "name": "update_deal_stage",
  "description": "WRITE. Move a deal to a new pipeline stage. Use only after the user confirms the change. Returns the updated deal.",
  "input_schema": {"type": "object", "properties": {
      "deal_id": {"type": "string", "description": "Deal id from find_deals, e.g. 'D-10432'"},
      "stage": {"type": "string", "enum": ["qualified", "proposal", "won", "lost"]}},
    "required": ["deal_id", "stage"]}
}
```

**Test tools with evals:** run realistic tasks, read transcripts, and iterate on names, descriptions and outputs; small wording changes often fix selection errors.
