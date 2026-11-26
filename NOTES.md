# Notes: wiring Claude into the course API

## Server: Context7 (`.mcp.json`)

Context7 serves version-specific library documentation. That matters here because the
project runs Express 4 while the current Express docs describe Express 5. For example,
Express 4 does not forward a rejected promise from an `async` handler to `next()`, and
Express 5 does. A specific version is addressed through the library ID, for example
`/expressjs/express/v4.22.1`. Context7 runs through `npx` (Node is already required) and
needs no credentials.

The package is pinned to `@upstash/context7-mcp@4.7.3`, and `--before=2026-11-19` makes npm
resolve its transitive dependencies as of that date. Without the date, a fresh clone would
pull whatever npm publishes that day. Both values sit at least a week behind the latest
releases, because brand-new releases are the usual vector for supply-chain attacks. To
update, raise the version and the date together.

The permission rule allows its two read-only tools by name:
`mcp__context7__resolve-library-id` and `mcp__context7__query-docs`. It does not allow the
whole server, so a tool added in a later release still asks before it runs. Claude Code
asks each person once to approve the server from `.mcp.json` in an interactive session.
`claude -p` starts it without asking unless `--strict-mcp-config` is set. The server's first real use
answered exactly the Express 4 question above.

## Skill: `add-endpoint`

The skill captures how an endpoint is added or changed here:
- a store helper in `db/store.js`, with any new state reset by `seed()`
- a router in `routes/`, mounted in `server.js`
- `400`/`404` with `{ "error": ... }` bodies
- supertest tests that call `store.reset()` before each test
- an entry in `docs/api.md`
- the Express 4 rule on `async` handlers

Before the skill, this knowledge was spread across `CLAUDE.md`, the code and the tests. The
skill refers to the conventions in `CLAUDE.md` rather than repeating them, so they have
a single source.

The description names three things:
- **what** it covers: the words that requests actually use (endpoint, route, resource,
  the HTTP verbs, the file names)
- **when** to use it: adding, extending or changing a route
- **when not** to: questions about existing behaviour, refactors that keep the interface,
  tooling changes

In a fresh headless session, "Add a DELETE /users/:id endpoint." loaded the skill as its
first step. "What does GET /health return?" did not load it.

## Command: `/review-changes`

The command reviews the current branch against a base ref and reports violations as
`path:line — rule — fix`. The base ref is passed as `$ARGUMENTS` and defaults to `main`.
Its checklist is `CLAUDE.md` plus the `add-endpoint` skill, so a new rule there is checked
automatically and nothing is maintained twice.

It is worth a shortcut because it runs before every pull request and should check the
same rules in the same report format every time. The git commands it runs are already in
Claude Code's built-in read-only set, so `allowed-tools` lists only Read, Grep and Glob.
A prefix rule such as `Bash(git log:*)` would also allow `git log --output=<file>`, which
writes arbitrary files. `allowed-tools` pre-approves tools; it does not block others, so
"do not edit" is enforced by the prompt, not by permissions. `disable-model-invocation`
keeps it a command that only a person starts.

Run against a throwaway commit with four planted violations, the command reported all
four. The violations were: direct array access instead of a store helper, a plain-text
`404`, a missing test and missing docs.

## Hook: lint after every edit (`PostToolUse`)

The hook reacts rather than prevents. On `PostToolUse` with the matcher `Edit|Write`,
`.claude/hooks/lint-edited-file.js` runs ESLint on the JavaScript file that was just
written; files outside the project are skipped. If ESLint reports errors, the hook exits with code 2, which hands the report
back to Claude so the error is fixed right away instead of failing CI later. Warnings do
not block, matching `npm run lint`.

`PostToolUse` fits because linting needs the written file and a lint error is cheap to
correct, so there is nothing to prevent. The script is plain Node because Node is
already required and `jq` is not. Without `npm ci` it prints a hint and does not block.
Edits made through Bash (for example `sed -i`) bypass it; CI stays the backstop.

Triggered on purpose, by appending `console.log(startedAt);` to a route file, the hook
returned the `no-undef` error to Claude.

## Headless run

The run checks whether `docs/api.md` still matches the implemented routes:

```sh
claude -p "Check whether docs/api.md matches the routes actually implemented in server.js \
and routes/: every method and path, required body fields, and every status code each \
handler can return. Report each mismatch as 'path:line — problem', or 'docs/api.md is in \
sync' if there is none. Do not change any files." \
  --tools "Read,Grep,Glob" \
  --allowedTools "Read,Grep,Glob" \
  --setting-sources project \
  --strict-mcp-config \
  --max-turns 10
```

What each flag locks down:
- `--tools`: Read, Grep and Glob are the only tools that exist, so there is no shell, no
  file writes and no web access.
- `--allowedTools`: those three run without a prompt, which a run with no one watching
  needs.
- `--setting-sources project`: personal settings cannot widen the permissions.
- `--strict-mcp-config`: no MCP servers, so no connected accounts.
- `--max-turns`: caps cost.

The run reported the docs in sync. A second run with the same flags was asked to run
`npm test` and write a report file. It could do neither, because those tools were not
available at all.

`--setting-sources` governs settings files, not `CLAUDE.md` instructions: a personal
`~/.claude/CLAUDE.md` still loads. On a CI runner there is none, so the output there can
differ slightly in tone, but not in what the run may do.
