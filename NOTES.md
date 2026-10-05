# Notes — wiring Claude into this repo

Four integrations, all committed, so a teammate who clones this branch gets the
same setup without configuring anything.

## The server: `filesystem`, pointed at `docs/`

`.mcp.json` connects the official `@modelcontextprotocol/server-filesystem` at
project scope, scoped to the `docs/` directory:

```json
"args": ["-y", "@modelcontextprotocol/server-filesystem", "./docs"]
```

**Why this one.** `docs/api.md` is the contract for this API — the status codes,
the response shapes, what each endpoint promises. Any work on a route needs it,
and the skill below requires keeping it in sync. It needs no API key, so there
is no secret to leak, and the path is relative, so it resolves correctly
wherever the repo is cloned.

**What the permission rule allows.** `.claude/settings.json` allows three
read-only tools rather than the whole server:

```json
"mcp__docs__read_text_file", "mcp__docs__list_directory", "mcp__docs__search_files"
```

The filesystem server also ships `write_file`, `edit_file`, `move_file` and
`create_directory`. Those are deliberately left out: this server exists so
Claude can *read* the contract. Docs changes should go through the normal edit
path, where they show up in the diff and get reviewed like any other change.
`enabledMcpjsonServers: ["docs"]` is set so the committed server is trusted on
a fresh clone instead of sitting at "pending approval".

**Used once, for real:** asked headless what `docs/api.md` says `PUT /users/:id`
returns for a missing user and what `POST /users` returns on success — it
answered 404 and 201 via `mcp__docs__read_text_file`, having read the file
through the server rather than with the built-in Read tool.

## The skill: `express-route`

**The repeated work it captures.** Every endpoint in this repo follows the same
four rules, and nothing in the code states them in one place: data access only
through `db/store.js`; `400` for bad input and `404` for a missing record, with
validation running *before* the lookup; error bodies always shaped
`{ "error": "message" }`; and a test file that calls `store.reset()` in
`beforeEach` and covers the happy path plus both failure paths. The skill adds
the step that is easiest to forget — updating `docs/api.md`.

**How the description is worded.** It names the concrete triggers ("a new
resource under `routes/`, a new method on an existing router (GET/POST/PUT/
DELETE), or a change to a route's validation or error responses") and then
lists what it governs. Naming the HTTP verbs and the directories keeps it from
firing on unrelated requests, while still catching a request phrased as
"add a DELETE endpoint" that never says the word "route".

**Confirmed firing.** Asked "I need to add a DELETE /users/:id endpoint — reply
with ONLY the name of the skill you loaded": the answer was `express-route`. A
longer run then produced the conventions verbatim, including the `store.reset()`
requirement and the docs update, without being told where to look.

## The command: `/api-review`

A review of the current changes against this project's own checklist — store
access, status codes, error shape, `undefined` handling, the three required
tests, docs sync, stray changes — then `npm test` and `npm run lint`, ending in
a "Ready to commit" / "Needs work" verdict. It takes `$ARGUMENTS` so it can be
pointed at a path or an earlier commit instead of the working tree.

**Why it deserves a shortcut.** This is the prompt that would otherwise be
retyped before every commit, and retyping it means it drifts: one day you ask
about tests, the next day you forget. The checklist is also exactly what a
reviewer on this repo checks, so running it first turns review comments into
things already fixed.

**Confirmed working.** Run against a deliberately bad route file it caught all
seven planted problems — own array instead of the store, `undefined`
dereferenced where a 404 belonged, `200` on a create, no input validation, a
bare string as an error body, no tests, docs not updated — and noticed the file
was never mounted in `server.js`.

## The hook: `PostToolUse` → `eslint --fix`

```json
"PostToolUse": [{ "matcher": "Edit|Write|MultiEdit",
  "hooks": [{ "type": "command", "command": "node .claude/hooks/eslint-fix.js" }] }]
```

**React, not prevent.** CI runs `npm run lint` on every push, so a lint error is
a broken build — but it is also a thing a machine can simply fix. `PreToolUse`
would have to block an edit it can't repair; `PostToolUse` lets the edit land
and then cleans it up, and reports back anything `--fix` can't resolve so Claude
corrects it in the same turn.

**The matcher** is the three editing tools, so the hook runs exactly when a file
changes. The script then filters again: only `.js` files, only inside the repo,
and only the paths the `lint` script actually covers (`routes`, `db`, `tests`,
`server.js`, `eslint.config.js`).

**Why Node and not a shell one-liner.** This is a Node project, so `node` is
guaranteed on any machine that can run the tests — no `jq`, no bash-only
syntax, identical behaviour on Windows, macOS and Linux.

**Watched it fire.** On `routes/health.js` it printed `[hook] eslint --fix
routes/health.js`; on a file with an undefined variable and an unused one it
reported both problems back; on a Markdown file it stayed silent.

## Run headless

```
claude -p "Run the project's test suite and report the pass/fail counts..." \
  --allowedTools "Bash(npm test:*)"
```

Output: `5 passed, 0 failed. Suite is green.`

**What was locked down.** One tool, and a prefix-scoped one at that: `npm test`
and nothing else. No `Edit`, no `Write`, no general `Bash`, so the run physically
cannot modify a file, install a package, or push — even if the prompt were
misread. The prompt also says "do not change any files", but that is a request;
`--allowedTools` is the actual boundary. Every other headless run in this
project was scoped the same way: the MCP check got only the three `mcp__docs__`
read tools, and `/api-review` got read tools plus `git diff`, `npm test` and
`npm run lint` — enough to inspect and report, not enough to change anything.

## One note for a fresh clone

Claude Code ignores a project's `permissions.allow` until the workspace is
trusted. On a fresh clone, run `claude` once in the project folder and accept
the trust prompt; the server, skill, command and hook then work as described
above.
