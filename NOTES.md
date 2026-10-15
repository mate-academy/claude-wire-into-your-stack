# NOTES

## 1. MCP server

I connected the filesystem MCP server at project scope in `.mcp.json`,
restricted to `docs/`. It is useful because Claude can read `docs/api.md`
without access to the rest of the machine.

`.claude/settings.json` allows only the read tools I use and explicitly
denies the filesystem write tools. I tested the server successfully:
reading worked and an attempted write was refused.

## 2. Skill

The project skill is `.claude/skills/add-route/SKILL.md`.

It captures the repeated workflow for route changes: use `db/store.js`,
validate with `400` and `404`, return JSON errors, update tests and
`docs/api.md`.

Its description is limited to adding or changing HTTP routes/endpoints.
I confirmed it triggered when I asked Claude to plan
`DELETE /users/:id` without naming the skill.

## 3. Command

The command is `.claude/commands/check-conventions.md`.

`/check-conventions` performs a read-only review of Git changes against
the project's conventions. It accepts an optional base branch and uses
`main` by default.

I tested it successfully and it returned:

`Aucun écart aux conventions.`

## 4. Hook

The project hook uses `PostToolUse` with the matcher `Edit|Write`.

It runs `.claude/hooks/lint-on-edit.js`, which executes ESLint after a
JavaScript file is edited or written. It does not use `--fix`.

I tested it with a temporary file containing `foo = 1;`.
ESLint reported `no-undef`, the hook returned code 2, and the temporary
file was then deleted.

## 5. Headless run

I ran:

`claude -p "/check-conventions main"`

with only `Read`, `git diff`, `git status`, and `git merge-base`
pre-approved.

`Edit`, `Write`, `NotebookEdit`, and `git diff --output*` were denied.
I also used `--strict-mcp-config` and `--max-turns 10`.

The result was `Aucun écart aux conventions.`.
After the run, `git status --short` was still empty and `HEAD` was
unchanged.

## Verification

- `npm test`: 5 passed, 0 failed.
- `npm run lint`: passed.
- No sensitive `.env`, key, credential, or private-key file is tracked.
- Secret-pattern scans found no secret values.
