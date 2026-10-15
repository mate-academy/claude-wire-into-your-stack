# Wiring notes

## Server
Connected the filesystem MCP server (`@modelcontextprotocol/server-filesystem`)
scoped to `./docs`, named `docs` in `.mcp.json`. It's credential-free and needs
only Node, which the project already requires, so it works on a fresh checkout
with no extra setup. `docs/api.md` is the reference every route change has to
stay in sync with, so scoping the server's root to `./docs` (rather than the
whole repo) means Claude can only reach that reference through it. The
permission rule in `.claude/settings.json` allows just
`mcp__docs__read_text_file`, `mcp__docs__list_directory`, and
`mcp__docs__search_files` — the three read tools actually used — and denies
`write_file`, `edit_file`, `create_directory`, and `move_file`, so the server
can be consulted but never used to change the docs. Used it for real twice:
once interactively (reading `docs/api.md` via `read_text_file` while
cross-checking it against `routes/`) and once as the headless task below.

## Skill
`.claude/skills/express-endpoint/SKILL.md` captures how this repo writes an
endpoint end to end: route file layout (`Router()`, paths relative to the
mount, one comment per handler), inline validation instead of middleware, the
400-vs-404 rule, the fixed `{ "error": "message" }` shape, routing all state
through `db/store.js` and its `seed()`/`reset()`, mounting in `server.js`
without disturbing the `require.main === module` guard, the `node:test` +
supertest test style (flat `test()`, no `describe`/`it`, `request(app)`), and
the matching `docs/api.md` section. The description names concrete trigger
phrases ("add DELETE /users/:id", "create a /posts resource") and is scoped
to "endpoint, route, or resource in this API" so it doesn't fire on unrelated
requests. Confirmed it fires: asked headless, without naming the skill, to
"Add a DELETE /users/:id endpoint to this API" — it added the route with the
correct 404/`{ error: 'User not found' }` handling, a `deleteUser` helper in
`db/store.js`, a `tests/users.test.js` entry in the existing style, and a
`docs/api.md` section, all unprompted. That demo diff was reverted before
committing so the PR only carries the wiring files.

## Command
`/api-review` (`.claude/commands/api-review.md`) reviews API code against the
same checklist the skill encodes: error shape, status codes, store-only data
access, mounting, test coverage, docs coverage, and `npm run lint`. Takes an
optional `$ARGUMENTS` path; with none, it reviews the current `git diff`
instead. Worth the shortcut because it's the check I'd otherwise do by hand
before every PR — running it on `routes/users.js` returned a clean per-item
pass/fail table with file:line citations and correctly flagged a non-blocking
gap (no test for the `PUT` 400 case) without treating it as a checklist
violation.

## Hook
A `PostToolUse` hook on the `Edit|Write` matcher runs
`node .claude/hooks/lint-after-edit.js` after any edit. It **reacts** (not
prevents) because "the edited file is lint-clean" can only be judged after
the write exists, and mirrors what CI already enforces (lint runs before
test). The script only acts on `.js` files inside the project's actual lint
scope (`server.js`, `routes/`, `db/`, `tests/`, `eslint.config.js`), exits 0
silently if `node_modules/eslint` isn't installed (so a fresh checkout before
`npm install` never gets spammed), runs `eslint --fix`, and on any remaining
error exits 2 with ESLint's report on stderr — the exit code Claude Code
reads as "fix this." Verified by feeding it a file with a real `no-undef`
error (exit 2, message printed) and a clean file (exit 0); the repo's ESLint
config has no stylistic rules, so `--fix` genuinely has nothing to rewrite,
which is expected here rather than a bug.

## Headless run
```
claude -p "Compare docs/api.md against the routes in routes/. Report any
endpoint, status code, or error-response mismatch. Do not modify any files."
  --allowedTools "Read,Grep,Glob,mcp__docs__read_text_file,mcp__docs__list_directory"
```
Locked down to read-only tools only — no `Bash`, `Write`, or `Edit` — because
a docs-vs-code audit never needs to run a command or change a file, so with
nobody watching it structurally can't touch the repo. The two `mcp__docs__*`
entries are the same read tools the permission rule already allows. Result:
confirmed `docs/api.md` and `routes/` are in sync (all five documented
behaviors match the code, no undocumented endpoints), and the run made zero
changes to the working tree.

## Verifying on a fresh checkout
```
npm install
claude mcp list                      # docs -> Connected
claude -p "add a DELETE /users/:id"  # express-endpoint skill fires
/api-review                          # or /api-review <path>
```
Edit a file under `routes/`, `db/`, or `tests/` to see the lint hook run.
