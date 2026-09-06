# Notes — wiring Claude into this repo

Four integrations, all committed, all exercised once before they were written up.

## The server: a read-only filesystem server over `docs/`

`.mcp.json` connects `@modelcontextprotocol/server-filesystem` at project scope,
scoped to `./docs`. `docs/api.md` is this project's API contract, and the most
common way a change here goes wrong is code and reference drifting apart. Giving
Claude a server whose entire world is that folder makes "check the docs against
the routes" a first-class move instead of a grep. It needs no credentials, so
nothing lands in `.mcp.json` that shouldn't be committed, and the path is
relative — the server resolves `./docs` against the project root, so a teammate's
clone works without editing the file. The version is pinned so everyone gets the
same server.

**The permission rule** (`.claude/settings.json`) allows six tools —
`read_text_file`, `read_multiple_files`, `list_directory`, `directory_tree`,
`search_files`, `get_file_info` — and explicitly denies the four that mutate:
`write_file`, `edit_file`, `move_file`, `create_directory`. Blanket-allowing
`mcp__docs__*` would hand a second, unreviewed write path into the repo that
sidesteps the lint hook below. Documentation edits should go through the normal
edit tools, where the project's other rules apply. `enabledMcpjsonServers` lists
the server so a fresh clone doesn't have to approve it by hand.

**Used on:** the docs audit in the headless run below, which read `docs/api.md`
through `mcp__docs__read_text_file` and compared it to the handlers.

## The skill: `api-endpoint`

The repeated way of working here is that **an endpoint is four files, not one** —
the router, a `db/store.js` helper, a test, and the `docs/api.md` entry — plus a
fixed validation contract (`400` for bad input, `404` for a missing record,
always `{ "error": "message" }`). That's the knowledge a newcomer gets wrong
first, and it isn't visible from any single file.

The description is written around the *situations* that should trigger it — a new
route file, a new method on an existing router, a change to validation, status
codes, or error responses, a resource that needs mounting — rather than the topic
"Express". Naming the concrete surfaces (`routes/`, `server.js`, `db/store.js`,
the error shape) is what keeps it off unrelated work.

**Confirmed both ways, without naming it:** "I need a `DELETE /users/:id`
endpoint" fired it (the plan came back as three files with the store helper and
the docs entry included); "What Node version does the CI workflow use?" did not.

## The command: `/api-review`

A review of changed API code against the project's own checklist — the one prompt
worth retyping most on this repo, and the one most likely to be typed
half-heartedly at 6pm. Saving it fixes the checklist in place: route shape,
validation contract, error shape, store access, test coverage per failure branch,
docs parity, then a real `npm run lint` and `npm test` rather than a guess. It
takes `$ARGUMENTS` as an optional target and falls back to the branch diff, and
its `allowed-tools` keep it to git, the two npm scripts, and reading.

**Confirmed on** a deliberately broken `routes/widgets.js` (route-local state,
bare-string 404, no validation, `200` on create, never mounted, no test, no docs).
It caught all of them and noted that lint and tests passed only vacuously, because
nothing exercised the file.

## The hook: lint on write, `PostToolUse`

- **Event — `PostToolUse`, so it reacts.** The standard being held is "the tree
  stays lint-clean," which is not knowable before the write happens. A
  `PreToolUse` guard would have to judge a file it hasn't seen yet.
- **Matcher — `Edit|Write|MultiEdit`,** the tools that change files.
- **Command — `node .claude/hooks/lint-fix.js`.** It runs the project's own
  pinned ESLint with `--fix` on the edited file, and if problems remain it exits
  `2` so the message goes back to Claude to fix in the same turn, instead of
  surfacing in CI ten minutes later. A relative path and a Node script (rather
  than a shell one-liner) keep it working on Windows and Unix alike.

It stays quiet where it should: only files `npm run lint` covers (`server.js`,
`routes/`, `db/`, `tests/`), and it exits `0` if `node_modules` isn't installed
yet, so a fresh clone doesn't fail on every edit.

**Confirmed:** an edit that left an undefined identifier in `tests/` came back
with `error 'stillUndefined' is not defined no-undef` reported to Claude.
Known gap: the matcher covers the edit tools, so a file rewritten through a shell
command isn't linted — CI is the backstop for that.

## The headless run

```
claude -p "Audit this API's documentation. Read docs/api.md through the 'docs' MCP
server, and read the route files under routes/ with the Read tool. Report every
endpoint that is documented but not implemented, or implemented but not
documented, and any documented status code a handler cannot actually return.
Report only; do not edit anything." \
  --permission-mode default \
  --allowedTools "mcp__docs__read_text_file,mcp__docs__list_directory,Read,Glob"
```

A documentation audit is a good unattended task: it needs to read widely and
should never write. So the allowlist is exactly the reading it needs — the two
docs-server tools for the reference, `Read` and `Glob` for the handlers — and
nothing else. No `Edit`, no `Write`, no `Bash`: with nobody there to answer a
permission prompt, a tool left out of the set simply cannot run, which is the
whole point. `--permission-mode default` matters, since a machine left in
bypass mode would ignore the allowlist entirely.

It reported the docs and routes in sync across all five endpoints, and flagged
two things worth knowing that weren't drift: the docs never state the success
code for the three `200` responses, and the `POST`/`PUT` validation returns `400`
today only because Express 4 defaults `req.body` to `{}` — under Express 5 the
destructure would throw first.
