# NOTES: wiring Claude into the course API

## Server (MCP)
**What:** `docs`, the official filesystem server (`@modelcontextprotocol/server-filesystem@1.0.0`), launched with `npx` and limited to `./docs`. It's set up at project scope in `.mcp.json`.

**Why here:** `docs/api.md` is the API contract, and the project's conventions say routes must match it. With the server, Claude can read the contract while changing routes, and both the skill and the `/review-route` command use it. It needs no credentials, so no secrets are involved. I pinned 1.0.0 deliberately: the 2.x releases require Node 24, and this project and its CI run on Node 20–22.

**Permission rule:** `permissions.allow` lists only three read-only tools: `mcp__docs__read_text_file`, `mcp__docs__list_directory` and `mcp__docs__search_files`. The server's write, edit, move and create-directory tools are still available, but they always ask first, so Claude can't quietly rewrite the docs.

**Used it:** I ran a headless check that read `docs/api.md` through `mcp__docs__read_text_file` and compared it with `routes/users.js`. It found that `PUT /users/:id` accepts `""` and `null`, while POST rejects them.

## Skill: `add-endpoint`
**What it captures:** this repo's four-step recipe for a new endpoint, in order:
1. A store helper in `db/store.js`.
2. The route, with 400-then-404 handling and the `{ error }` shape.
3. supertest tests with `store.reset()`, one per status code.
4. An entry in `docs/api.md`.

The last two are the steps that get forgotten most.

**Description wording:** it opens with the trigger ("Use when adding a new HTTP endpoint or route…"), then gives three example requests ("add DELETE /users/:id", "add a GET /notes endpoint", "create a route to search users"). It ends with an explicit exclusion ("Not for editing an existing route's behaviour…") so it doesn't fire on unrelated edits.

**Confirmed it fires:** in a throwaway worktree I asked "Add a DELETE /users/:id endpoint to this API." without naming the skill. Claude's first tool call was `Skill add-endpoint`. It then added the store helper, the route, three tests and the docs entry, and lint and tests passed.

## Command: `/review-route <file>`
**What:** reviews a route file against the CLAUDE.md conventions and `docs/api.md`:
- store-only data access
- validation order and type checks
- the `{ error }` shape
- status codes and `return`ed responses
- one test per status code
- drift from the docs

It then runs lint and tests, and ends with **ready** or **needs changes**.

**Why a shortcut:** it's the check I'd run before every PR. Typing out six criteria each time would mean some get skipped. Its `allowed-tools` are read-only plus `npm test` and `npm run lint`, so it can't edit code.

**Ran it:** `/review-route routes/users.js` returned "needs changes". It flagged non-string input accepted by POST and PUT, missing 400 tests, and an un-returned `res.json` in `GET /users`.

## Hook: lint after every edit
**React or prevent:** react, on **PostToolUse**.

**Matcher:** `Edit|MultiEdit|Write`.

**Command:** `.claude/hooks/lint-edited-file.sh`:
- It runs `eslint --fix` on the edited file, but only for `.js` files inside the project and not under `node_modules`.
- If errors remain, it exits 2, which sends ESLint's output back to Claude to fix.

This holds the same standard as CI's lint step, but the moment code is written. I chose to react rather than prevent because a PreToolUse hook can't lint code that hasn't been written yet.

**Triggered on purpose:** I asked Claude to append `logStartup();` to `routes/health.js`. The hook exited 2 with `'logStartup' is not defined (no-undef)`, and Claude reported the error back. During the DELETE run above, the hook also ran after every edit and passed (exit 0).

## Headless run
**Command:**
```
claude -p "/review-route routes/users.js" --allowedTools "Read" "Grep" "Glob" "Bash(npm test)" "Bash(npm run lint)" "mcp__docs__read_text_file"
```

**What's locked down:**
- Allowed: reading and searching files, the two npm scripts, and the one MCP read tool the review needs.
- Not allowed: no Edit or Write, no other shell commands (so no `git` and no network), and none of the docs server's write tools.

Anything outside that list is denied rather than prompted, because nobody is there to answer a prompt. The review is useful unattended, for example in CI or on a schedule, because it can only report, never change anything. The run cost about $0.18 and needed no tools beyond the allowed set.

## Gotcha
Claude Code ignores `permissions.allow` in `.claude/settings.json` until the folder has been trusted in an interactive session. Until then, headless runs print "Ignoring 3 permissions.allow entries… workspace has not been trusted" and depend entirely on `--allowedTools`. Hooks and `.mcp.json` still loaded. A teammate cloning the repo should run `claude` interactively once and accept the trust dialog, and the project MCP server prompt too.
