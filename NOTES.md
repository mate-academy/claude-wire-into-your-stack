# NOTES

## Server

Connected `@modelcontextprotocol/server-filesystem`, pinned to version `2026.7.10`, scoped to
`./docs`, as the `docs` server in `.mcp.json`. It's credential-free and useful specifically for
this repo: `docs/api.md` is the API's contract (status codes, the `{ "error": "message" }` shape),
and both the skill and the `/api-review` command read it before judging any route change, so code
and docs don't drift apart silently.

The permission rule in `.claude/settings.json` allows only the server's seven read-only tools
(`read_text_file`, `read_multiple_files`, `list_directory`, `directory_tree`, `search_files`,
`get_file_info`, `list_allowed_directories`) rather than blanket-allowing `mcp__docs__*`, and
explicitly denies `write_file`, `edit_file`, `create_directory`, and `move_file`. `docs/` holds a
single hand-written reference file; nothing should ever write to it through this server.

Used it for real: ran `claude -p "Use the docs MCP server to read docs/api.md and list every
documented endpoint with its status codes..."`, which returned the correct list pulled straight
from the file. Also used in the headless task below.

## Skill

`.claude/skills/express-route/SKILL.md` captures the one shape every endpoint in this repo
follows: a store helper in `db/store.js`, a router in `routes/<resource>.js` mounted in
`server.js`, a test in `tests/<resource>.test.js`, and a matching section in `docs/api.md` — plus
the smaller conventions that repeat across `routes/users.js` (the `// METHOD /path —` comment
style, `Number(req.params.id)` coercion, `400`/`404` with `{ "error": "message" }`, `201` on
create).

The description names the trigger phrasing directly ("add a DELETE /users/:id endpoint",
"scaffold a route for projects", "wiring up any new path under routes/") and an explicit
non-trigger clause for unrelated changes. Confirmed it fires: asked
`claude -p "I want to add a DELETE /users/:id endpoint..."` without naming the skill, and it
opened by name ("following the `express-route` skill") and reproduced every convention correctly.
Confirmed it does *not* over-fire on an unrelated question ("What Node version does CI use?") —
no skill invocation, just a direct answer.

## Command

`.claude/commands/api-review.md` → `/api-review <path>`. This is the review checklist I'd
otherwise retype before every PR on this repo: error shape, status codes, state access via
`db/store.js`, mounting, test coverage per branch, and docs agreement — with `allowed-tools`
restricted to reads plus `npm test`/`npm run lint`, so the command can review but never edit.

Ran `/api-review routes/users.js`: it caught three real test-coverage gaps (no happy-path test for
`GET /users/:id`, no `400`-branch test for `POST /users`, no `400`-branch test for `PUT /users/:id`),
correctly flagged a `NaN`-id edge case as debatable rather than a violation, confirmed everything
else (error shape, status codes, docs agreement), and ran `npm test`/`npm run lint` — all without
touching a file.

## Hook

`.claude/settings.json` wires a **PreToolUse** hook on the **Bash** matcher, running
`.claude/hooks/guard-bash.js`. It prevents rather than reacts, since the standard it holds
("never run an unrecoverable command") only matters *before* the command executes — a
PostToolUse hook would be too late. It's a plain Node script (no dependency on `node_modules`,
so it holds on a fresh clone before `npm install`), reading the tool-call JSON off stdin and
exiting 2 (blocking, with a reason on stderr) for: `rm` combining recursive + force flags in any
combination, `git push --force`/`-f`/`--force-with-lease`, `git reset --hard`, `git clean -fd`,
and `npm publish`. Everything else exits 0 untouched.

Triggered it on purpose: asked Claude to delete a non-empty scratch folder with `rm -rf`. It
attempted the command, the hook blocked it, and Claude reported back verbatim: "A pre-commit-style
hook (`.claude/hooks/guard-bash.js`) blocks any `rm` with both `-r` and `-f`... Could you run it
yourself." Confirmed a harmless command (`ls docs`) still passes through unaffected.

## Headless run

Ran, with nobody watching:

```
claude -p "Read docs/api.md through the docs MCP server, then read routes/users.js and \
routes/health.js. List any endpoint implemented in code but missing from docs/api.md, and any \
documented but not implemented. Short markdown list only. Do not edit files." \
  --allowedTools "mcp__docs__read_text_file,mcp__docs__list_directory,Read,Grep"
```

Locked down to exactly four tools: the two read-only `docs` MCP tools, plus `Read`/`Grep` for the
route files (which sit outside the server's `./docs` root, so the MCP tools can't reach them).
No `Bash`, no `Write`/`Edit`, and every `docs` write tool excluded — the task is a pure
doc/code-drift check, so there was never a reason to grant anything beyond reads. It returned:
"All endpoints in code match the docs, and vice versa — no discrepancies," which is correct as of
this branch.
