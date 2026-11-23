# Notes: wiring Claude into this project

All of this is committed, so anyone who clones the repo gets the same setup. On a new clone,
run `npm install` first (the hook needs ESLint), then accept Claude Code's trust prompt and the
approval for the project's MCP server.

## 1. MCP server: `docs`
- **Which server:** the official filesystem server, `@modelcontextprotocol/server-filesystem`,
  pinned to version `2.2.0`. It only sees the `./docs` folder. It is set up in `.mcp.json` at
  project scope and needs no key.
- **Why it is useful here:** `docs/api.md` is the API reference. Claude can read it, but it
  cannot reach the rest of my disk.
- **Why this version:** `2.2.0` has no install scripts and has signed provenance. The newest
  version (`2.4.0`) was only 5 days old, so I did not use it.
- **What my permission rule allows:** in `.claude/settings.json`, `permissions.allow` lists only
  `mcp__docs__read_text_file` and `mcp__docs__list_directory`. The server has 16 tools and 6 of
  them write, move or copy files. I did not allow any of those.
- **Checked:** with Claude's built-in tools turned off, a new headless run connected to `docs`,
  read `docs/api.md` with `read_text_file`, and listed all 5 endpoints correctly. No permission
  was denied.

## 2. Skill: `add-api-route`
- **The way of working it captures:** every route change touches four places: `db/store.js`, the
  route in `routes/`, a `supertest` test, and `docs/api.md`. It also keeps the error rules: `404`
  for a missing record, `400` only for a bad request body, errors shaped as `{ "error": "..." }`,
  and `204` with no body for a successful DELETE.
- **How I worded the description:** it says when to use the skill ("adding or changing an Express
  route or endpoint") and gives example requests. It lists the files it covers and says what it is
  not for (unrelated bugs, refactors, changes outside the API). This stops it from firing on
  everything.
- **Checked, without naming the skill:** it fired for "Add a DELETE /users/:id endpoint" and for
  "Make PUT /users/:id also accept an optional 'role' field". It did not fire for a README edit or
  a typo fix in a comment. The code it wrote passed lint and tests.
- **A problem the first test showed:** the first version of the skill let Claude return `400` for
  `/users/abc`, while `GET` and `PUT` return `404`. I added two lines to fix this and tested again.

## 3. Command: `/review-conventions [base-branch]`
- **What it does:** it reviews my current changes, including uncommitted ones, against the rules in
  `CLAUDE.md`: routes, data access through the store, status codes, the error shape, tests and
  docs. It also runs `npm run lint` and `npm test`. The base branch is optional. If I give none, it
  uses the local `main` when that exists, and `origin/main` when it does not. It tells me which one
  it used.
- **Why it is worth a shortcut:** it is a checklist I would type often. It is read-only, and its
  `allowed-tools` list only allows reading files, `git diff`, `git status`, `git log`,
  `git rev-parse`, lint and test.
- **Checked:** on a copy with deliberate mistakes (state kept in the route, wrong status codes,
  `{ message }` instead of `{ error }`, no test, no docs) it reported 5 failures. On a correct change
  it said "Ready".
- **An improvement from the fresh-clone check:** a fresh clone of a branch has no local `main`, so my
  first version had no clear base to compare with. I added the `origin/main` fallback above. I tested
  it in a single-branch clone with the changes committed: it used `origin/main` and reported the
  problems, it said "Ready" for a correct change, and it used the local `main` when I created one.
  One weakness remains: in 2 of 4 runs it marked the "Routes" item as FAIL for a broken handler,
  although that problem belongs under the other items.

## 4. Hook: lint after edits
- **What it is:** a `PostToolUse` hook, so it reacts after an edit and does not prevent anything. The
  matcher is `Edit|Write|MultiEdit`. The command is `.claude/hooks/lint-js.js`, which runs the
  project's ESLint on the one `.js` file that was edited.
- **Why:** CI already runs `npm run lint`, so the hook gives Claude the same feedback right away. If
  there are errors, the script exits with code 2 and Claude sees the report. It ignores other file
  types, files outside the project and files in `node_modules`.
- **Checked:** the script exited with 2 for a JS file with an error. It exited with 0 for clean JS,
  `.md`, `.json`, missing files, outside files, `node_modules` files and empty input. It exited with 1
  when ESLint was not installed. In a real run, Claude wrote a file with an error, the hook fired
  with exit code 2, and Claude received the report. For an edit to `docs/api.md`, the hook ran,
  exited with 0 and did nothing.
- **Limit:** a matcher can only match tool names, not file types. So the script starts on every edit
  and then skips files that are not JavaScript.

## 5. Headless run
- **What I ran:** a read-only check that compares `docs/api.md` with the real routes and lists any
  differences.
- **Command:** `claude -p "..." --tools "Read,Grep,Glob" --allowedTools "Read" "Grep" "Glob"
  --disallowedTools "Bash" "Edit" "Write" "MultiEdit" "NotebookEdit" "WebFetch" "WebSearch"
  --strict-mcp-config --disable-slash-commands --no-session-persistence --max-budget-usd 0.50`
- **What I locked down:** the run can only read files. It has no shell, no editing and no web access.
  It loads no MCP servers, skills or commands, it saves no session, and it cannot spend more than
  $0.50.
- **Checked:** it made 6 tool calls, all `Read` or `Glob`, and none were denied. `git status` and
  `HEAD` were the same afterwards. It cost about $0.04.
- **Result:** the docs and the routes match. The docs leave out some success status codes, the exact
  error messages, and the `404` for a non-numeric id.

## Issue found: weak validation in `PUT /users/:id`
`routes/users.js:33` only checks `=== undefined`. A body like `{ "name": "" }` or `{ "name": null }`
passes the check, and `db/store.js` saves the empty value. `POST` already rejects empty values with
`!name || !email`. I did not fix it, because this project is about setting up Claude, not changing
what the app does. A small follow-up would reject an empty or non-string `name` and `email` with `400`.
