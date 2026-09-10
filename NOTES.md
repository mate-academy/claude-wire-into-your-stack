# NOTES

## MCP server
Connected `docs-filesystem`, a filesystem MCP server scoped to `./docs`
(`.mcp.json`). It's useful here because `docs/api.md` is the hand-maintained
source of truth for the API surface, and this gives Claude a dedicated,
read-only lens onto just that folder instead of the whole repo. The
permission rule in `.claude/settings.json` allows only
`mcp__docs-filesystem__read_text_file` and `mcp__docs-filesystem__list_directory`
— read access, no write/edit/delete tools from that server, so Claude can
consult the docs but never silently rewrite them through this path.

## Skill
`add-api-resource` captures the repo's repeated "scaffold a new CRUD
resource" workflow: store helpers in `db/store.js`, a route file mirroring
`routes/users.js`, mounting in `server.js`, a test file mirroring
`tests/users.test.js`, and a new section in `docs/api.md` — always in that
order, always copying the existing pattern rather than inventing a new one.
The description is worded around the trigger phrases someone would actually
type ("add a /products resource", "create a new endpoint for orders",
"scaffold a new resource") plus explicit negative cases (not for fixing an
existing route, not for generic Express questions) so it fires on genuine
new-resource requests and stays out of the way otherwise.

## Command
`/summarize-changes` — reads `git status`/`git diff` (or a diff against a
given ref) and produces a prose summary grouped by repo area (routes/,
db/store.js, tests/, docs/api.md), flagging anything that drifts from the
`CLAUDE.md` conventions. It's worth a shortcut because "what changed and
does it follow our conventions" is a review question I'd otherwise re-type
the same way every time before opening a PR — the command fixes the format
and the read-only constraint (no staging/committing) so it's safe to run on
a whim.

## Hook
A `PostToolUse` hook on the `Edit|Write` matcher (`.claude/settings.json`,
script at `.claude/hooks/lint-fix.js`). It's reactive, not preventive: it
never blocks a tool call, it runs after a `.js` file under `server.js`/
`routes/`/`db/`/`tests/` is written and immediately applies `eslint --fix`
to just that file, so lint-autofixable issues (e.g. a redundant `!!`
double-negation) get corrected without anyone having to remember to run
`npm run lint`.

## Headless run
Ran, with `claude -p` and nobody watching: add `tests/health.test.js`
covering the `GET /health` route, following the conventions in the existing
test files, then run `npm test` to confirm. Locked down with
`--allowedTools "Read,Edit(tests/*.test.js),Bash(npm test)"` — unrestricted
read access (harmless, needed to study conventions), edit access scoped to
only `*.test.js` files inside `tests/` (so it could add the one file but
never touch `routes/`, `db/`, `server.js`, or docs), and `Bash` scoped to
exactly `npm test` (no general shell, no git, no install). It added the
test file and confirmed all 13 tests pass, touching nothing outside that
one scoped path.
