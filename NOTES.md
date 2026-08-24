# Wiring Claude Code into this project

Notes on the five pieces of wiring added in this branch, and why each one is
shaped the way it is.

## 1. The MCP server

**`api-docs`** — the reference filesystem server
(`@modelcontextprotocol/server-filesystem`), added at project scope so it lands
in a committed `.mcp.json`, and pointed at **`./docs`** and nothing else.

It is useful here because `docs/api.md` is this project's contract, and it
drifts from `routes/` — the audit below found the reference silently omits the
`200` on `PUT /users/:id`. Confining a server to `docs` gives that contract a
handle that is path-sandboxed by construction: even a confused agent cannot
walk out of the directory into `db/`, `.env`, or the rest of the disk. The path
is relative, so a fresh checkout on any OS resolves it correctly, and the
server needs **no credentials**, so nothing had to be referenced as `${VAR}`
and no secret is committed.

**The permission rule.** The server ships fourteen tools, four of which mutate
the filesystem. I allowed only the three read tools I actually use:

```
allow: mcp__api-docs__read_text_file
       mcp__api-docs__list_directory
       mcp__api-docs__search_files
deny:  mcp__api-docs__write_file, edit_file, create_directory, move_file
```

Allow-listing alone would only mean the rest *prompt*; the explicit `deny`
makes writes impossible rather than merely inconvenient. So the server that can
see the docs can never edit them — doc changes stay in normal, reviewable edits.

**Used on a real task**, and the scoping visibly held: asked to summarise the
documented endpoints, the run reached for `list_allowed_directories` first,
that call was **denied** because it is not in the allow-list, and the answer
came back through `read_text_file` alone. The rule is doing real work, not
decorating the config.

## 2. The skill

**`.claude/skills/api-route-tests/`** captures how tests are written *here*, a
shape all five existing cases share: Node's built-in runner (`node:test` +
`node:assert` — no Jest, `npm test` is bare `node --test`), supertest driving
the app imported from `server.js` rather than a listening port, and
`store.reset()` in `beforeEach` because `db/store.js` is module-level mutable
state that otherwise leaks between tests. It also fixes the coverage the
project's own conventions imply: happy path, a `400` per validation branch, a
`404` per `:id` route.

**Wording it so it fires.** The description leads with the trigger phrasings a
request actually uses ("add tests for the new route", "cover the 400 case",
"write a regression test for that 404") rather than describing the content, and
ends with an explicit boundary — *"Not for writing the route itself"* — to keep
it off route-authoring requests.

Confirmed both directions without naming it:

- *"I'm adding a DELETE /users/:id endpoint. **Cover it for me** — I want the
  success case and the missing-record case checked."* → fired. Worth noting the
  prompt never contains the word "test".
- *"Explain how `db/store.js` keeps state between requests."* → correctly did
  **not** fire.

## 3. The command

**`/route-check <resource>`** audits one resource against a ten-point
checklist: the six CLAUDE.md conventions (own router file, all data access
through the store, `400` on bad input, `404` on missing, the
`{ "error": "message" }` shape, `201` on create), then whether `docs/api.md`
still matches the code, then whether the tests cover each branch.

It earns a shortcut because it is the review I would otherwise retype before
every merge, and because it spans three places that drift independently —
route, docs, tests. `$ARGUMENTS` fills the resource name, so `/route-check
users` and `/route-check health` reuse one saved prompt.

It paid for itself immediately. On `users` it found a real data-corruption bug
nobody had written down: `PUT /users/:id` accepts `{ "name": null }`, because
the route guards on `=== undefined` and `store.updateUser` re-checks
`!== undefined`, so `null` passes both gates and blanks a stored field on a
`200`. It also flagged that both `400` branches are untested.

**Adjusted after the first run.** The run was correct but reached for a shell
to check test coverage. Since the command is a read-only review, the saved
prompt now says so outright — read the test file, don't run `npm test` or
`git`. The re-run finished with zero blocked calls.

## 4. The hook

**`PostToolUse`** on matcher **`Edit|Write`**, running
`node .claude/hooks/lint-changed.js`. It **reacts** rather than prevents, and
that is the deliberate choice: CI runs `npm run lint` on every push and pull
request, so the failure this guards against is a red build, not a destructive
act. Blocking the write would be the wrong tool — the edit is fine, it just
needs finishing. So the hook lets the write land, runs ESLint `--fix` on it,
and only speaks up if problems survive the autofix, exiting `2` so the lint
output goes back to Claude to repair.

Three details that matter on a committed, cross-platform hook:

- It is invoked through `node`, not a shell one-liner, so it behaves the same
  on Windows, macOS, and Linux, and it calls `eslint`'s JS entry point directly
  rather than the `.cmd`/`.ps1` shims.
- It **fails soft**: no `file_path`, a non-JS file, anything under
  `node_modules`, a path outside the repo, a malformed payload, or a checkout
  where `npm ci` hasn't run yet all exit `0` silently. A hook that fires on
  every edit must never be the thing that wedges the session.
- Verified on both paths — a file with an undefined variable produced exit `2`
  with the `no-undef` output; clean JS, Markdown, vendored, and malformed input
  all stayed quiet.

Watched it fire live: a headless run told to write a deliberately broken
`hook-probe.js` got the ESLint failure fed straight back through `PostToolUse`.
The probe file was deleted afterwards.

## 5. The headless run

```
claude -p "/route-check users" --allowedTools "Skill,Read,Grep,Glob"
```

A code review is the right first thing to run unattended: it is genuinely
useful, it repeats, and it is **read-only by construction**, so the blast
radius is bounded by the task itself and not only by the flag.

**What I locked down and why.** `Read`, `Grep`, and `Glob` are everything an
audit needs — open the route, the store, the docs, the tests. Everything else
is absent by omission, which is the point: no `Write` or `Edit`, so the review
cannot "helpfully" apply its own findings unreviewed; no `Bash`/`PowerShell`,
so it cannot run installs, `git`, or anything with side effects; and none of
the `mcp__api-docs__*` tools, since the audit reads `docs/api.md` locally and
does not need the server. `Skill` is in the list for one specific reason,
learned the hard way: in `-p` mode a slash command is **dispatched through the
`Skill` tool**, not pre-expanded into the prompt. My first attempt omitted it,
the dispatch was denied, and the model fell back to reading the command file
and following it by hand — the right answer, by the wrong route. With `Skill`
allowed, `Skill:route-check` fires cleanly.

The general lesson: an allowlist tight enough to be worth having will surface
mistakes as *denials*, not as errors — twice here (`list_allowed_directories`,
then `PowerShell`), and both times the denial was the system working.
