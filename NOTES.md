# NOTES — wiring Claude into the Course API

## Server (MCP)

**What:** the reference filesystem server (`@modelcontextprotocol/server-filesystem`)
pointed at `./docs`, connected at project scope in `.mcp.json`.

**Why it's useful here:** `docs/api.md` is the written contract for this API —
status codes, the `{ "error": "message" }` error shape, the request/response
bodies. Giving Claude a first-class way to read that folder means it checks new
or changed routes against the documented behaviour instead of guessing, and it
keeps the docs and the code from drifting apart.

**Permission rule:** `.claude/settings.json` → `permissions.allow` lists only the
server's read-only tools (`read_text_file`, `read_file`, `list_directory`,
`directory_tree`, `search_files`, `get_file_info`, …). The write tools
(`write_file`, `edit_file`, `move_file`, `create_directory`) are deliberately
left out, so the server can inform Claude's work on the repo but never mutate the
docs on its own.

**Used it once:** asked Claude to confirm the new `DELETE /users/:id` behaviour
against the API reference — it read `docs/api.md` through the server and matched
the `204` / `404` contract before the code was written.

## Skill

**File:** `.claude/skills/add-route/SKILL.md`.

**Repeated way of working it captures:** how a resource is added to this API —
one router file per resource in `routes/`, mounted in `server.js`; all state
through `db/store.js`; validation in the route with `400` on bad input and `404`
on a missing record; every error response shaped `{ "error": "message" }`;
`201`/`200`/`204` status codes; tests in `tests/<resource>.test.js` with
`node:test` + `supertest` and `store.reset()` in `beforeEach`.

**How the description is worded so it fires:** it names the concrete triggers a
request would use — "adding a new resource, route, or endpoint", with examples
like "add a products route" and "create a DELETE /users/:id endpoint" — and
scopes itself to *this Express API*, so it fires on route work and not on
unrelated edits.

## Command

**File:** `.claude/commands/review-api.md`, run as `/review-api`.

**What it does:** reviews the current diff (or a path passed as `$ARGUMENTS`)
against the project's convention checklist from `CLAUDE.md` — router layout,
store access, validation, error shape, status codes, test style, lint/tests
passing — and reports issues as `file:line` + fix, ending with a
ready-to-commit verdict.

**Why it's worth a shortcut:** it's the same pre-PR self-review run on every
change; behind a `/name` it's one keystroke instead of re-typing the checklist,
and it keeps the review consistent between contributors.

## Hook

**File:** `.claude/settings.json` → `hooks.PostToolUse`.

**Reacts or prevents:** reacts. Event is `PostToolUse`, matcher is
`Edit|Write|MultiEdit`, command is `npm run lint`. After Claude edits a file the
linter runs, so a style or unused-variable regression surfaces immediately
rather than in CI. It's a reaction, not a `PreToolUse` block, because the
standard is "the tree stays lint-clean", not "this particular edit is dangerous".

## Headless run

**Task:** add `DELETE /users/:id` (`204` on success, `404`
`{ "error": "User not found" }` when the id is unknown), plus a `store.deleteUser`
helper and two tests.

**Command:**

```
claude -p "Add a DELETE /users/:id route: 204 on success, 404 { error: 'User not found' } when the user does not exist. Add a store.deleteUser helper and tests in tests/users.test.js. Follow CLAUDE.md conventions." \
  --allowedTools "Read" "Edit" "Bash(npm test)" "Bash(npm run lint)"
```

**What was locked down and why:** only `Read` and `Edit` on the working tree
(no `Write` — the task only changes existing files), and exactly two shell
commands, `npm test` and `npm run lint`, so the run can verify itself. No
general `Bash`, no network, no git — nothing it needs to touch is outside that
set, so it's safe to run unattended.
