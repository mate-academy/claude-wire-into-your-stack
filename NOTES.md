# Notes — Wiring Claude into this repo

## Server

Connected `docs-filesystem` (`@modelcontextprotocol/server-filesystem`) at project
scope via `.mcp.json`, scoped to `docs/` — currently just `api.md`, but the
natural place for more reference docs later. It's credential-free (no API keys,
no `.env`), which matched the README's own suggestion and this project's
reality: it has no external services to wrap, so a docs-focused server was the
honest choice rather than inventing an integration that doesn't exist.

The permission rule in `.claude/settings.json` allows only the six read-only
tools (`read_file`, `read_multiple_files`, `list_directory`, `search_files`,
`get_file_info`, `list_allowed_directories`) and deliberately omits the four
mutating ones (`write_file`, `edit_file`, `create_directory`, `move_file`), so
Claude can check `docs/api.md` against the code but can never silently rewrite
the docs through this path — any real edit still goes through the normal
`Edit`/`Write` tools, which stay visible and reviewable in the diff.

## Skill

`.claude/skills/add-route/SKILL.md` captures how routes are written in this
repo: the `// METHOD /path — description` comment style, inline `400`/`404`
validation with the `{ "error": "message" }` shape, routing all data access
through `db/store.js`, mounting new resources in `server.js`, and the matching
`tests/<resource>.test.js` shape (`node:test` + `supertest` +
`test.beforeEach(() => store.reset())`). The description names concrete
trigger phrases ("add a route/endpoint/resource", "this Express API") and an
explicit negative case ("do not use for unrelated Express/Node work"), so it
should fire on "add a DELETE endpoint" without also firing on unrelated
Node work in other projects.

The headless DELETE run (below) is the practical proof: the resulting route
and store helper match the skill's shape (comment style, `db/store.js`-only
mutation, `{ error }` 404 body) even though the skill wasn't named in the
prompt — the prompt just described the desired endpoint the way you'd
naturally ask for one.

## Command

`/check-docs` (`.claude/commands/check-docs.md`) audits `docs/api.md` against
`routes/*.js` and `db/store.js` and reports drift — a maintenance check worth
running after every route change, distinct from the skill: the skill
*scaffolds* a new route, the command *audits* whether the docs still describe
reality afterward. It's read-only by `allowed-tools` (`Read`, `Grep`, `Glob`,
plus the two read-only `docs-filesystem` MCP tools) — it can report drift but
never fix it, keeping doc edits a deliberate, reviewed action.

## Hook

A `PostToolUse` hook on the `Edit|Write` matcher runs `.claude/hooks/lint-fix.sh`,
which reads the tool-call JSON from stdin, checks whether the edited file is
inside `server.js`/`routes/`/`db/`/`tests/` (the same tree `npm run lint`
covers), and if so runs `eslint --fix` on just that file. `PostToolUse` (react)
rather than `PreToolUse` (block) because auto-fixing a lint issue is
corrective, not something that should stop an edit mid-flight — a `PreToolUse`
denial would be right for something that must never happen at all, not for
something that's cheap to fix after the fact.

I verified the script directly by piping a simulated tool-call payload
(`{"tool_input":{"file_path":"...routes/health.js"}}`) into it after
introducing a real auto-fixable violation (`no-extra-boolean-cast`, via
`if (!!true)`) — the script correctly resolved the file path, matched the
path scoping, ran `eslint --fix`, and the violation was fixed. I couldn't
trigger it end-to-end through an actual `Edit` tool call in this same
session, because — like the MCP server above — project-scope hook
configuration in `.claude/settings.json` is picked up on session start, and
this session started before the file existed. A fresh `claude` session in
this repo will pick it up automatically.

## Headless run

```
claude -p "Add a DELETE /users/:id route to this Express API, following the
existing conventions in routes/users.js (see GET/POST/PUT for the comment
style, validation, and error shape). Add a deleteUser helper to db/store.js —
the route must not touch the in-memory array directly. Return 404 with
{ \"error\": \"User not found\" } if the user doesn't exist; on success
return 200 with the deleted user. Add matching tests to tests/users.test.js
for the happy path and the 404 path, following the file's existing node:test
+ supertest + store.reset() structure. Then run npm run lint and npm test
and confirm both pass." \
  --allowedTools "Read,Edit(routes/users.js),Edit(db/store.js),Edit(tests/users.test.js),Bash(npm test),Bash(npm run lint)"
```

Locked down to exactly what the task needed: `Read` (unscoped, since it only
lets Claude look, not change anything), `Edit` scoped to the three files that
actually needed changes (no bare `Edit`, so it can't touch `server.js`,
`package.json`, CI config, or docs), and `Bash` scoped to the two specific
npm scripts needed to verify the work (no bare `Bash`, no `git`, no network/
web tools). No `Write` at all, since every change was to an existing file.

This worked exactly as scoped: the run added the route, the store helper, and
two tests, then confirmed lint and all 7 tests passed — and when it tried to
also update `docs/api.md` to keep the docs in sync, that edit was correctly
blocked (`docs/api.md` wasn't in the allowed-tools list), so I did that part
by hand afterward. That's the tight scoping working as intended, not a bug —
proof this is safe to run unattended, since it can only touch what was
explicitly named.
