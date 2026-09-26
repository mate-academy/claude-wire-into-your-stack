---
description: Read-only review of Git changes against CLAUDE.md conventions
argument-hint: [base-branch]
allowed-tools: Read Bash(git diff *) Bash(git status *) Bash(git merge-base *)
disallowed-tools: Edit Write NotebookEdit Bash(git diff --output*)
---

Perform a strictly read-only review of the changes in this repository.

Never create, edit, delete, or move a file.
Never use shell redirections or `git diff --output`.

Base branch: $ARGUMENTS

If no base branch was provided, use `main`.

## Steps

1. Run `git merge-base <base> HEAD` to determine the fork point.
   If the base branch does not exist, report that and stop.

2. Run `git diff <fork-point>` to inspect committed and uncommitted
   changes.

3. Run `git status --short` to identify untracked files.
   Read any relevant untracked file with the Read tool.

4. Read changed files when surrounding context or exact line numbers
   are needed.

If there are no changes, say so in one line and stop.

## Check the project conventions

Only evaluate rules relevant to the changed files.

- One route file per resource in `routes/`, mounted in `server.js`.
- Data access goes through `db/store.js`; routes do not hold state.
- Bad or missing input returns `400`.
- A missing record returns `404`.
- Errors use JSON in the shape `{ "error": "message" }`.
- Tests cover the relevant success, `400`, and `404` cases.
- `docs/api.md` is updated when an API route changes.
- No secrets, credentials, tokens, passwords, private keys, or
  `.env` files are introduced.

## Report

Write the report in French and keep it short.

For each problem, report:

`path/to/file:line - règle - correction suggérée`

If nothing is wrong, answer:

`Aucun écart aux conventions.`

Only report findings. Do not fix anything.
