**Immediate response**

1. Stop the agent and revoke its credentials.
2. **Restore** from backup or point-in-time recovery; verify integrity.
3. Preserve logs and traces; run a blameless post-mortem.
4. Notify affected stakeholders as required.

**Why it happened (typical)**

- The agent held **production write/delete credentials** and shared environments with development.
- Safety relied on **prompt instructions** ("do not delete data"), which fail under confusion, ambiguity or injection.
- No approval step, no dry run, no limits on destructive commands, no backups tested.

**Prevention: make irreversible mistakes structurally hard**

| Control | How |
|---|---|
| **Least privilege** | Agents get **read-only** access by default; no production credentials in agent environments; separate roles for dev, staging, production |
| **Environment separation** | Agents work in dev/sandbox/copies; promotion to production through human-reviewed CI/CD |
| **Permission policy in code** | Block destructive operations (`DROP`, `TRUNCATE`, `DELETE` without `WHERE`, `rm -rf`, force-push) or require explicit approval |
| **Human approval** for destructive or production actions, with a clear preview of the exact command and its target |
| **Dry-run and diff** | `--dry-run`, `EXPLAIN`, show the rows that would be affected, row-count limits |
| **Reversibility** | Soft deletes, transactions, snapshots/branches before changes (database branching), PITR enabled, **tested restores** |
| **Rate and scope limits** | Max rows affected, protected resources and tags (`prod`) the agent cannot touch |
| **Audit and kill switch** | Log all commands; alert on destructive patterns; one-click disable |

```python
DANGEROUS = re.compile(r"\b(drop|truncate)\b|\bdelete\s+from\b(?!.*\bwhere\b)", re.I)

def run_sql(sql, env, approved=False):
    if env == "production" and not approved:
        raise PermissionError("production writes require human approval")
    if DANGEROUS.search(sql) and not approved:
        raise PermissionError("destructive statement blocked; request approval")
    return db.execute_in_transaction(sql, max_rows=1000, dry_run=not approved)
```

**Principle:** the model is not a security boundary. Combine capability limits, approvals and recoverability so that even a confused or hijacked agent cannot cause unrecoverable harm.
