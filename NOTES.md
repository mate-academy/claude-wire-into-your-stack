# NOTES.md — wiring Claude into this repo

## Server (MCP)

Connected the `fetch` server (`@modelcontextprotocol/server-fetch`) at project
scope in `.mcp.json`. It's credential-free and genuinely useful on this repo:
when writing or reviewing Express routes, being able to pull in an actual
Express/Node API reference beats guessing from memory. A filesystem server
pointed at `docs/` was the other option on the table, but it would have been
redundant — Claude Code already reads local files natively.

The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch`
— the single read-only tool this server exposes — rather than a blanket
allow for the server.

Note for whoever picks this up: the fetch tool only becomes available (and the
permission rule only takes effect) after the workspace's trust dialog is
accepted. A headless run against this repo printed `Ignoring 1
permissions.allow entry from .claude/settings.json: this workspace has not
been trusted` — run Claude Code interactively here once and accept the trust
prompt before relying on the server or the hook below.

## Skill

Added `.claude/skills/add-express-route/SKILL.md`. The repeated pattern it
captures: every resource router here follows the same shape — one file per
resource, validation before touching the store, `400`/`404`/`{"error": ...}`
conventions, a matching `tests/*.test.js` using `node:test` + `supertest`
with `store.reset()` in `beforeEach`, and a `docs/api.md` update. The
description is scoped narrowly ("adding a new resource endpoint... to this
Express API") specifically so it fires on route-scaffolding requests and stays
out of the way for unrelated bug fixes or refactors.

## Command

Added `/sync-api-docs` (`.claude/commands/sync-api-docs.md`) — a prompt to
diff `docs/api.md` against the actual routers and fix any drift. Worth a
shortcut because docs/api.md is hand-maintained (noted as a maintenance
burden in `CLAUDE.md`), and this is the kind of check worth running after any
route change, not just when someone remembers to. Ran it by hand once: it
correctly found no drift on the current routes rather than inventing changes.

## Hook

Set a **PreToolUse** hook on the `Bash` matcher
(`.claude/hooks/guard-risky-commands.js`) in `.claude/settings.json`, project
scope. It blocks (exit code 2) commands matching destructive patterns —
`rm -rf`, `git push --force`, `git reset --hard`, `git clean -f` — before
they run.

Originally tried a PostToolUse auto-fix-on-edit hook, but this repo's
`eslint.config.js` only extends `js.configs.recommended`, which (as of
ESLint 9+) carries almost no auto-fixable rules — a test file with a
double-semicolon wasn't even flagged. Auto-format would have been a no-op
here, so I went with the guard instead: it reacts to something that can
actually happen (a destructive command), and it matters most exactly when
nobody's watching — e.g. a headless run — since there's no permission prompt
to reject it.

Verified the matching/blocking logic directly (piped sample tool-call JSON
into the script): `git push origin main --force` and `rm -rf /some/path`
both exit `2` with a message; `git status` passes through with exit `0`.
Live enforcement inside this session needs the same trust-dialog acceptance
mentioned above.

## Headless task

Ran, read-only, with `claude -p`:

```
claude -p "Read every router in routes/ and compare it against docs/api.md. ... Do not edit any files." --allowedTools "Read,Grep,Glob"
```

Locked it down to `Read,Grep,Glob` only — no `Bash`, no `Edit`/`Write` — since
the task is purely a comparison-and-report; there was no reason to grant
anything that could change files or run shell commands for a job that only
reads and reasons. It correctly reported no drift between `docs/api.md` and
the routes.
