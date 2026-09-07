# Wiring notes

How Claude is set up to work on this repo, and why.

## Server (MCP)

**`fetch`** (`uvx mcp-server-fetch`), declared in `.mcp.json`.
It lets Claude pull in external references while working on the API.

**Permission rule:** `.claude/settings.json` allows exactly `mcp__fetch__fetch` —
the server's single, read-only tool.

## Skill

`.claude/skills/add-api-route/SKILL.md` captures the repeated "add a new REST
resource" flow.

The description is:
> Use when adding a new REST resource or endpoint to this Express API — creating
  a new file under routes/, its data helpers in db/store.js, and its mount in
  server.js. Triggers on requests like "add a /products endpoint", "new resource
  for orders", "expose a route for X". Not for editing an existing route, fixing
  a bug in one, or non-API code.

## Command

`/sync-api-docs` (`.claude/commands/sync-api-docs.md`). `docs/api.md` is
hand-maintained and drifts whenever a route changes. The command diffs every
router against the docs — method, path, body fields, status codes, response
shape — and fixes `docs/api.md` only, in the existing style. Worth a shortcut
because it's run after every route change and the check is tedious to do by hand.

## Hook

`PostToolUse`, matcher `Edit|Write`, in `.claude/settings.json`.
It lints the project when the edited file is `.js`. It **reacts** after the edit rather than preventing it. Non-`.js` edits are ignored.

## Headless run

`npm run review` — a thin wrapper around `claude -p "/review-changes"` with a
locked-down toolset:

```
claude -p "/review-changes" \
  --allowedTools "Read,Grep,Glob,Bash(git diff:*),Bash(git log:*),Bash(git status:*)"
```

The `/review-changes` command (`.claude/commands/review-changes.md`) reviews the
new code on the branch (`git diff main...HEAD` plus the working tree) for four
things: test coverage of every response a route returns, the API contract
(`{ "error": "message" }` shape, right status codes), store encapsulation
(`seed()`/`reset()` covers new state), and `docs/api.md` sync. It's **advisory** —
it prints numbered findings and always exits 0.

Locked to read-only inspection: `Read` / `Grep` / `Glob` and three git-read
commands. No `Edit` / `Write`, no general `Bash`, no network — it can report on
the diff but cannot change a file or reach outside the repo. The same three
`Bash(git …:*)` reads are in `.claude/settings.json` so the command also runs
without prompts interactively.
