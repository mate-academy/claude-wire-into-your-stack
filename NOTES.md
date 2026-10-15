# NOTES — wiring Claude into this repo

## Server (MCP)

I connected a **filesystem server** (`@modelcontextprotocol/server-filesystem`) scoped to
the `docs/` folder, at project scope in `.mcp.json`. It's credential-free and gives Claude
a first-class way to read the API reference in `docs/` without me pasting it in.

The permission rule in `.claude/settings.json` allows **only the read tools** I actually
use — `read_file`, `read_text_file`, `list_directory`, `directory_tree`, `search_files`,
`get_file_info`, `list_allowed_directories` — and deliberately leaves out the server's
write tools (`write_file`, `edit_file`, `move_file`, `create_directory`). So the server can
look at the docs but never change them. I verified it end-to-end: it reports `docs/` as its
only allowed directory, lists `api.md`, and reads its contents.

## Skill

The skill `scaffold-route` captures **how a new route/resource is built in this repo**: one
route file per resource mounted in `server.js`, all data access through `db/store.js`,
`400`/`404` validation with the `{ "error": "message" }` shape, and a matching
`node:test` + `supertest` test file with `store.reset()` in `beforeEach`. The description is
worded around the concrete trigger — "adding a new resource or endpoint to this Express API,
a new route file, a new `/something` path" — so it fires when someone asks for a new route
but not on unrelated edits.

## Command

`/check` reviews the current branch's changes against the project's conventions checklist
(route-per-resource, store-only data access, status codes, error shape, tests pass, lint
clean, no leftovers). It's worth a shortcut because it's the exact pre-commit pass I'd run
every time, and it bundles `git diff`, `npm test`, and `npm run lint` into one consistent
report instead of me re-typing the checklist.

## Hook

A **PostToolUse** hook (it *reacts*, after the fact) matching `Write|Edit`. It runs
`.claude/hooks/eslint-fix.sh`, which parses the edited file path from the hook payload and
runs `eslint --fix` on it when it's a `.js` file. So every edit Claude makes to JS stays
lint-clean automatically. Verified by feeding it a file with `if (!!flag)` — the hook
rewrote it to `if (flag)`.

## Headless run

I ran a read-only task headless:

```
claude -p "List every HTTP route this API exposes ..." --allowedTools "Read" "Glob"
```

I locked it down to just `Read` and `Glob` — enough to read `server.js` and `routes/`, but
no `Bash`, `Write`, or `Edit`. With nobody watching, the worst it can do is read source
files; it can't run commands or change anything.
