# Wiring notes

How Claude is set up on this repo, and why each choice.

## Server (MCP) — `course-docs`

**What:** a filesystem MCP server (`@modelcontextprotocol/server-filesystem`)
at **project scope** in `.mcp.json`, rooted at `./docs`.

**Why it's useful here:** `docs/api.md` is the source of truth for the API
surface. Rooting a server at `./docs` lets Claude pull the exact request
body, status codes, and error shapes for an endpoint while writing or
reviewing a route, instead of guessing or re-reading the whole file into
context. It's credential-free and needs no network.

**Permission rule** (`.claude/settings.json` → `permissions`): rather than
blanket-allowing the server, only the read tools are allowed —
`read_text_file`, `read_file`, `read_multiple_files`, `list_directory`,
`directory_tree`, `search_files`, `get_file_info` — and the mutating tools
(`write_file`, `edit_file`, `create_directory`, `move_file`) are explicitly
denied. So the server can answer questions about the docs but can never
change them; doc edits still go through the normal reviewed path.

**Used it on a real task:** ran the headless job below to list every route
and check it against `docs/api.md` — it reported all five routes documented,
none stale.

## Skill — `express-resource-route`

**Repeated way of working it captures:** adding or changing a REST resource.
In this repo that always means the same five moves — a `routes/<name>.js`
router, matching helpers in `db/store.js` (routes never hold state),
`app.use('/<name>', ...)` in `server.js`, a `node:test` + `supertest` file
that resets the store in `beforeEach`, and a `docs/api.md` section — plus the
`400`/`404` validation and `{ "error": "message" }` response conventions.
Left implicit, the store step and the docs step get skipped.

**How the description is worded to fire on the right request:** it leads with
the trigger phrasings ("add a POST /projects route", "give users a delete
endpoint", "new resource for comments"), names the concrete files involved,
and ends with explicit exclusions ("Not for frontend, deploy/CI, or
dependency changes") so it doesn't fire on unrelated work.

## Command — `/check-conventions`

**What:** reviews a diff against the seven conventions from `CLAUDE.md`
(routing, state-through-store, validation, error shape, tests, docs, lint)
and prints `RESULT: PASS` / `RESULT: FAIL (n issues)`. Takes an optional
`$ARGUMENTS` target (a path, a commit range, or `staged`); defaults to the
unstaged working diff, which it inlines with `!git --no-pager diff`.

**Why it's worth a shortcut:** this is the check run before every commit and
every PR on this repo. The conventions are easy to half-follow — the store
indirection and the docs update are the usual misses — and typing the full
checklist each time is what makes it get skipped.

## Hook — destructive-command guard

**Event / matcher / command:** `PreToolUse` on `Bash`, running
`node .claude/hooks/guard-bash.js`.

**Prevents, not reacts:** it runs *before* the shell command and exits `2` to
deny it when the command matches `rm -rf`, `git push --force` /
`--force-with-lease`, `git reset --hard`, `git clean -f`, or
`git checkout -- <path>`. Everything else passes through untouched. Chosen as
a `PreToolUse` guard rather than a `PostToolUse` formatter because these
actions are irreversible or rewrite shared history — the standard that has to
hold is "an automated run can't wipe the tree or clobber the branch," and
that only helps if it's enforced before the command runs. It's a Node script
(not a shell one-liner) so it behaves identically on Windows and CI.

**Verified:** `git push --force origin main`, `rm -rf ./docs`, and
`git reset --hard HEAD~3` are all blocked with exit 2; `npm test`,
`git push origin main`, and `rm file.txt` pass.

## Headless run

```
claude -p "List every HTTP route in this repo as 'METHOD /path -> file:line',
then say whether docs/api.md documents each one. Read-only; do not modify
anything." --allowedTools "Read,Grep,Glob"
```

**What was locked down:** only `Read`, `Grep`, and `Glob` — no `Edit`, no
`Write`, no `Bash`, no MCP tools. The task is pure inspection (walk the
routers, cross-check the docs), so a read-only allowlist is all it needs and
it's safe to run unattended. It returned the five routes with file:line and
confirmed `docs/api.md` covers each one.

> Note: on a fresh clone, run `claude` once interactively in the project and
> accept the trust dialog before the `.claude/settings.json` allowlist and
> hook take effect (`hasTrustDialogAccepted`).
