# Notes

**Server:** Connected `@modelcontextprotocol/server-filesystem` scoped to `./docs`
(committed `.mcp.json`, project scope) as the `docs` server. It's useful here
because `docs/api.md` is this project's source of truth for request/response
shapes, and letting Claude read it directly (instead of guessing from routes
alone) keeps new endpoints honest about what they promise. Credential-free by
design. The permission rule in `.claude/settings.json` allows only the
read-only tools (`read_file`, `read_text_file`, `read_multiple_files`,
`list_directory`, `list_directory_with_sizes`, `directory_tree`,
`search_files`, `get_file_info`, `list_allowed_directories`) and explicitly
denies `write_file`, `edit_file`, `create_directory`, `move_file` — the server
only ever needs to be consulted, never used to touch files on its own. Used it
with `claude -p "Using the docs MCP server, read docs/api.md and list every
endpoint it documents..." --allowedTools "mcp__docs__read_text_file,
mcp__docs__list_directory"` and got back the correct list of five endpoints.

**Skill:** `.claude/skills/express-route-conventions/SKILL.md` captures the
pattern every route in `routes/` already follows: one file per resource
mounted in `server.js`, data access only through `db/store.js` helpers,
`400`/`404` status codes, the `{"error": "message"}` response shape, and the
`test.beforeEach(() => store.reset())` test setup. Wrote the description to
name the trigger explicitly ("adding, changing, or reviewing an Express
route/endpoint") and to exclude what it's not for (unrelated JS, tests-only
edits). Confirmed it fires: asked headless, without naming the skill, to "add
a DELETE endpoint for removing a user by id" — it added a `deleteUser` helper
in `db/store.js`, a `404` + `{"error": "User not found"}` response, and left
everything else alone, matching the skill's rules exactly. Reverted that
change afterward since it wasn't part of this PR's scope.

**Command:** `/new-route <resource>` in `.claude/commands/new-route.md`
scaffolds a brand-new resource end to end — router file, store helpers,
`server.js` mount, a `docs/api.md` section, and a test file — because that's
five files that all have to agree with each other, and hand-copying the
`users` route each time is exactly the kind of repeated, mechanical task worth
a shortcut. Took `$ARGUMENTS` as the resource name. Ran it once as
`/new-route notes`: it scaffolded a working `notes` resource, all 9 tests
(5 existing + 4 new) passed, and it left `users`/`health` untouched as
instructed. Reverted the scaffolded files afterward — this PR only ships the
wiring, not a new resource.

**Hook:** A `PostToolUse` hook on the `Edit|Write` matcher, in
`.claude/settings.json`, running `node .claude/hooks/eslint-fix.js`. It reacts
(not prevents) because linting is a "fix it after" standard, not something
that should block an in-progress edit. The script reads the hook's JSON
payload from stdin, only acts on `.js` files, and runs `eslint --fix` on the
touched file — auto-fixing what's fixable and surfacing the rest as warnings,
so the project's `npm run lint` standard holds without anyone remembering to
run it by hand. Triggered it deliberately by appending an unused variable to
`routes/health.js` and piping a matching Edit payload into the hook script:
it ran ESLint and reported the `no-unused-vars` warnings as expected, then I
reverted the test edit.

**Headless run:** The `/new-route notes` run above doubled as the headless
task: `claude -p "/new-route notes" --allowedTools "Read,Write,Edit,Grep,
Glob,Bash(npm test:*)"`. Locked it down to exactly what the command needs —
`Read`/`Grep`/`Glob` to study the existing `users` route as a pattern,
`Write`/`Edit` to create the new files, and `Bash` scoped to only
`npm test:*` (not a general shell) to verify the result — nothing broader,
and no MCP write tools, since scaffolding a route doesn't need to touch
`docs/` through the filesystem server (it edits `docs/api.md` directly via
`Edit`, which is a normal project file, not something routed through the MCP
server).
