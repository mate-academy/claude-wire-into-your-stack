# NOTES

## The server I connected

I connected the **fetch** MCP server at project scope in `.mcp.json` (`uvx mcp-server-fetch`).
It is useful here because working on this Express API constantly means checking external
API references and docs — HTTP status-code semantics, Express router behaviour, library
READMEs — and the fetch server lets Claude pull those pages into the session instead of me
copy-pasting. The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch`,
the server's single read-only "retrieve a URL" tool, rather than blanket-allowing the
`fetch` server. `.claude/settings.local.json` enables the server from the committed
`.mcp.json` so the whole team gets it on checkout.

## The skill I taught

The `api-route-conventions` skill captures how a route file in `routes/` is written in this
repo: one `express.Router()` per resource exported with `module.exports` and mounted under
its base path in `server.js`, all state access going through `db/store.js` helpers (with
`Number(req.params.id)` conversion), validation in the handler returning `400` for bad
input and `404` for a missing record, and the `{ "error": "message" }` error shape. The
description is scoped by action and location — it names the concrete trigger ("adding,
changing, or reviewing a route handler in `routes/`", with `routes/users.js` and
`routes/health.js` as examples) and lists explicit exclusions ("Do NOT use for changes
outside `routes/`, such as `db/store.js`, `server.js` wiring alone, tests, or docs"), so it
fires on route work and stays quiet otherwise. Confirmed it triggers when asked to add a
route without naming the skill.

## The command I added

`/review-route` (`.claude/commands/review-route.md`) reviews a route file against the same
checklist the skill encodes — mounting, data access through the store, status codes, error
shape — and reports a per-file verdict with `file:line` citations without modifying
anything. It takes `$ARGUMENTS` for a specific file and defaults to every file in `routes/`
when called bare. It is worth a shortcut because it is a check I want to run on every route
change and before every PR; saving it behind a `/name` means the full checklist prompt is
one keystroke instead of re-typed prose that drifts each time.

## The hook I set

A **PostToolUse** hook in `.claude/settings.json` with matcher `Edit|Write` that runs
`npm run lint`. It **reacts** rather than prevents — it runs *after* an edit lands and
surfaces any lint violation immediately, rather than blocking the tool call up front. The
event is PostToolUse because the standard here is "the tree stays lint-clean after Claude
edits it," which is something to verify on the result, not a risky command to gate. Trigger
it by editing any file and watch `npm run lint` run.

## What I ran headless

I ran `/review-route` headless with `claude -p`, pointed at `routes/`, with
`--allowedTools` limited to read-only tools (`Read`, `Grep`, `Glob`). That is all the
command needs to read the route files and produce its report, and locking the set down to
those means an unattended run cannot edit files, run shell commands, or reach the network —
it can only look and report, which is exactly the command's contract ("Do not modify any
files").
