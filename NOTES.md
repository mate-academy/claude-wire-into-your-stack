# Wiring notes

How Claude is set up to work on this repo, and why.

## Prerequisites

- **`uv` / `uvx`** — required for the `fetch` MCP server below. Install with
  `curl -LsSf https://astral.sh/uv/install.sh | sh` or `brew install uv`. The
  server package version is pinned in `.mcp.json`; `uvx` downloads it on first
  use, so nothing else needs installing.
- This repo's CI (`.github/workflows/ci.yml`) runs only `npm ci` / lint / test —
  it never starts the MCP server, so CI needs no extra setup. The `uv`
  prerequisite is only for a developer machine where Claude actually uses
  `fetch`.
- **`claude` CLI on `PATH`** — required for `npm run review` (below).

## Server (MCP)

**`fetch`** (`uvx mcp-server-fetch@2026.8.18`), declared in `.mcp.json`. It lets
Claude pull in external references while working on the API — mostly MDN
status-code pages when a new route needs a code the existing ones don't cover.
The version is pinned so every teammate runs the same one.

**Permission rule:** `.claude/settings.json` allows exactly `mcp__fetch__fetch` —
the server's single, read-only tool.

## Skill

`.claude/skills/add-api-route/SKILL.md` captures the repeated "add a new REST
resource" flow.

The description is:

> Use when adding a new REST resource or endpoint to this Express API — creating a new file under routes/, its data helpers in db/store.js, and its mount in server.js. Triggers on requests like "add a /products endpoint", "new resource for orders", "expose a route for X". Not for editing an existing route, fixing a bug in one, or non-API code.

## Command

`/sync-api-docs` (`.claude/commands/sync-api-docs.md`). `docs/api.md` is
hand-maintained and drifts whenever a route changes. The command diffs every
router against the docs — method, path, body fields, status codes, response
shape — and fixes `docs/api.md` only, in the existing style. Worth a shortcut
because it's run after every route change and the check is tedious to do by hand.

`/review-changes` (`.claude/commands/review-changes.md`) reviews new branch code
for test coverage, the `{ "error": "message" }` contract, store encapsulation,
and `docs/api.md` sync. Worth a shortcut because it's the pre-PR check — run
every time, easy to skip.

Both commands assume `main` is the base branch. `/review-changes` accepts a
different base ref as `$ARGUMENTS` (e.g. `/review-changes develop`).

## Hook

`PostToolUse`, matcher `Edit|Write`, in `.claude/settings.json`. It lints the
project when the edited file is `.js`. It **reacts** after the edit rather than
preventing it. Non-`.js` edits are ignored.

`.claude/settings.json` invokes the script with an explicit `sh` prefix, so it
runs even on a checkout where the executable bit was lost. `$CLAUDE_PROJECT_DIR`
is provided by Claude Code for hooks; the script falls back to its own location
when run by hand. If the hook payload isn't the JSON shape it expects, it logs a
line to stderr and skips the lint rather than failing silently.

## Headless run

`npm run review` — a thin wrapper around `claude -p "/review-changes"`. Allowed
only `Read`, `Grep`, `Glob`, and read-only git (`git diff` / `log` / `status`) —
no `Edit` / `Write`, no network. Advisory: it prints findings and always exits 0
(`|| true`), so it never blocks a script that runs it.
