# NOTES

## 1. MCP server

Connected `docs-fs`, a filesystem MCP server (`@modelcontextprotocol/server-filesystem`)
scoped to this repo's `docs/` folder, at project scope in `.mcp.json`. It's useful here
because the API reference in `docs/api.md` is hand-maintained and drifts easily from the
actual routes — having a server that can read (and only read) that folder makes it cheap
to cross-check docs against implementation without giving broader filesystem access.

The permission rule in `.claude/settings.json` allows only the read-only tools
(`read_text_file`, `list_directory`, `search_files`, `get_file_info`) and explicitly
denies the mutating ones (`write_file`, `edit_file`, `create_directory`, `move_file`),
rather than blanket-allowing the server. Used it for a real task: read `docs/api.md`
through the server and diffed its documented endpoints against `routes/users.js` and
`routes/health.js` — confirmed they match (no drift found).

## 2. Project skill

The repeated pattern this project has is "add a new REST resource": a store helper pair
in `db/store.js`, a router in `routes/`, a mount line in `server.js`, a test file, and a
docs section — always in that shape, following the `users` resource as the template.
That's encoded in `.claude/skills/new-route/SKILL.md`.

The description is worded to fire specifically on requests to add/create/scaffold a new
resource or endpoint (with the exact example phrasing "add a products resource"), and
explicitly says *not* to use it for editing an existing route's behavior, so it doesn't
compete with normal edit requests. Confirmed it fires: asked for "add a products resource
with CRUD (name and price fields)" without naming the skill, and it scaffolded
`db/store.js` helpers, `routes/products.js`, `tests/products.test.js`, the `server.js`
mount, and a `docs/api.md` section, all matching the `users` shape. `npm run lint` and
`npm test` both passed (10/10 tests). That verification scaffold was reverted afterward
since this PR should only carry the tooling files, not a new resource.

## 3. Custom command

Added `/summary` (`.claude/commands/summary.md`), which runs `git diff main...HEAD` and
`git log main..HEAD --oneline` and writes a PR-ready summary (title, "## Summary",
"## Test plan"). It's worth a shortcut because writing that summary by hand at the end of
every branch is repetitive and easy to under-scope (forgetting the test plan, or padding
the summary with lockfile/formatting noise) — the saved prompt bakes in "group by concern,
not by file" and "skip housekeeping-only diffs" so the output is consistently PR-ready on
the first try.

## 4. Hook

Set a `PostToolUse` hook (project-scoped, in `.claude/settings.json`) matching `Edit|Write`
that runs `eslint --fix` on the touched file whenever it's under `routes/`, `db/`, or
`tests/`. It **reacts** rather than prevents — it's a standard ("code touching the app
layer stays lint-clean"), not a guard against a dangerous action, so `PostToolUse` is the
right event; a `PreToolUse` block would just add friction to every edit for no benefit.
I verified the hook's command logic directly (piped a synthetic `PostToolUse` payload into
it and confirmed it correctly detects matching paths and that `eslint --fix` resolves a
real fixable violation, e.g. `if (!!value)` → `if (value)`). I did not observe it fire
automatically inside this run, since this session executes as a nested/child session
under an orchestrator — that's a known constraint of *this* environment, not the hook
config. Worth re-confirming it auto-fires in a normal interactive `claude` session before
relying on it.

## 5. Headless run

Ran one task with `claude -p "Run npm test in this repo and reply with a one-line summary
in the form 'pass: N, fail: N' — nothing else." --allowedTools "Bash(npm test:*)"`. Locked
it down to exactly that one Bash command pattern — no file edits, no other shell commands,
no network tools — because the task is read-only by nature (running the existing suite and
reporting the result), so there's no reason to grant anything beyond the one command it
needs to do its job unattended.
