# NOTES - wiring Claude into course-api

Everything below is committed in the repo, so it reaches every teammate who clones it. There are no secrets anywhere, and `.env` / `.env.*` stay git-ignored and are also denied in permissions.

## 1. Server (MCP): `docs`, a filesystem server pointed at `./docs`
**What.** `.mcp.json` connects `@modelcontextprotocol/server-filesystem` at **project scope**, rooted at `./docs`. It needs no credentials. `.claude/settings.json` turns on just this server (`enabledMcpjsonServers: ["docs"]`), so it isn't a blanket "trust all project servers".

**Why it helps.** `docs/api.md` is the contract for this API. With the server, Claude can read and search it directly when it adds or reviews an endpoint, and it can't wander outside `docs/`.

**Permission rule.** `permissions.allow` lists only the read-only tools Claude actually needs: `mcp__docs__read_text_file`, `mcp__docs__list_directory` and `mcp__docs__search_files`. The write tools (`write_file`, `edit_file`, `move_file`, `create_directory`) are in `deny`, so the docs can only change through a normal reviewed edit, never through the server.

**Using it.** The first real task for the server is "check `docs/api.md` against `routes/users.js` for `PUT /users/:id`". I ran it in a fresh Claude Code session (v2.1.331, macOS) on a fresh clone of this branch, after accepting the workspace trust prompt. Claude called `mcp__docs__list_allowed_directories` and then `mcp__docs__read_text_file` on `docs/api.md`. `read_text_file` was pre-approved by `allow`. `list_allowed_directories` was not in `allow` at the time, and Claude Code's auto mode approved it as a read-only call. Since it is read-only and Claude reaches for it first, I have now added it to `allow` as well. The four write tools stay in `deny`. `api.md` says the body may include `name`, `email` or both, with a `400` when neither is sent and a `404` for an unknown id. That matches the route. While checking, I noticed that `name: ""` is accepted and the docs don't say so. That is noted for a follow-up, not changed here.

## 2. Skill: `.claude/skills/add-route/SKILL.md`
**What it captures.** It records the way every route in this project is written:
- The handler goes in `routes/<resource>.js`, with a `// METHOD /path — …` comment.
- Data access goes only through `db/store.js`, and new helpers are reset in `reset()`.
- Validation: for ID-based routes, `Number(id)` and then 404 before 400. Create routes have no id and go straight to the 400 input check. Every error has an `{ error }` body.
- Each route gets supertest tests using `store.reset()`, covering success and 400, plus 404 for ID-based routes.
- `docs/api.md` is updated.
- `npm test` and `npm run lint` must pass.

**How the description fires.** It names the action and the objects in the words people actually type: *add, create, or change an endpoint, route, or API method (GET/POST/PUT/PATCH/DELETE) in this project*. It also says what the skill does, so Claude can match it. It doesn't fire on unrelated work such as "fix the README" or "explain the store". **Observed firing.** In that same fresh session I asked *"add a DELETE /users/:id endpoint"* without mentioning the skill. Claude said it would use the add-route skill and followed its steps in order: a `deleteUser` store helper, the route, tests and the `docs/api.md` entry. The result was 7 of 7 tests passing. I then reverted those changes with `git checkout .`, because the endpoint was only a test of the skill and not part of this PR.

## 3. Command: `/review-route <METHOD /path>` (`.claude/commands/review-route.md`)
**What.** It reviews one endpoint against a five-point checklist (store-only data, 404/400 shapes, status codes, tests, docs) and asks for PASS/FAIL with file:line evidence plus the single most important fix. It is report-only and doesn't touch files. `$ARGUMENTS` takes the endpoint as one free-form value, for example `/review-route PUT /users/:id`.

**Why it's worth a shortcut.** This review comes up on every PR that touches `routes/`, and typing the checklist each time is how items get skipped.

**Running it once on `PUT /users/:id`** gave these results:
1. PASS: data goes through `store.updateUser`.
2. PASS: an unknown id gives 404, and a non-numeric id becomes `NaN` and gives 404. 400 when neither field is sent.
3. PASS: success returns 200.
4. FAIL (`tests/users.test.js`): no test covers the 400 "neither field" case.
5. PASS: the docs match.

Top fix: add the 400 test. That result was useful enough to keep the prompt exactly as it is.

## 4. Hook: PostToolUse on `Write|Edit` - lint the file Claude just changed
**What.** The hook lives in `.claude/settings.json` at project scope. On **PostToolUse**, with matcher `Write|Edit`, it runs `.claude/hooks/lint-edited-file.sh`. The script reads the edited `file_path` from the hook's JSON on stdin and ignores anything that isn't `.js`. It then runs ESLint on that one file. On errors it exits `2`, so ESLint's output goes back to Claude and Claude fixes the file before continuing.

**React or prevent.** It **reacts**: the edit has already happened, and the hook holds the standard that no `.js` file is left failing lint. I chose PostToolUse because linting needs the written file. Blocking risky commands is already handled by the deny list.

**Triggered on purpose.** I fed the hook the payload for an edit to a bad file (an undefined `foo()` and an unused variable). It printed ESLint's 1 error and 1 warning and exited `2`. For a clean `routes/users.js` it exited `0`, and for `docs/api.md` it was skipped with exit `0`. It runs path-relative to `$CLAUDE_PROJECT_DIR`, with no hardcoded absolute paths.

**Triggered through Claude Code.** In the fresh session, the project hook ran after each of the 5 edits Claude made for the DELETE endpoint: `db/store.js` twice, `routes/users.js`, `tests/users.test.js` and `docs/api.md`. Every `.js` file passed ESLint, so the hook exited `0` and printed nothing. `docs/api.md` was skipped because it isn't `.js`. A separate `npm run lint` was also clean. One lesson came out of this. In an earlier attempt the workspace wasn't trusted yet, and Claude Code ignored the project settings, so the hook didn't run. Project hooks and permissions apply only after the trust prompt has been accepted.

## 5. Headless run with a scoped `--allowedTools`
**Task.** Add the missing 400 test that `/review-route` found, then run the tests.

```
claude -p "Add a test in tests/users.test.js for PUT /users/:id returning 400 when neither name nor email is sent, following the existing tests, then run npm test." \
  --allowedTools "Read,Edit(tests/**),Bash(npm test:*)" \
  --max-turns 6
```

**What I allowed and why.**
- `Read`, to read the route and the existing tests.
- `Edit`, limited to `tests/**`. It may add a test but can't change the route or anything else.
- `Bash(npm test:*)`, to check its own work.

Nothing else is pre-approved: no other Bash, no network and no git. With nobody watching, any other action has no approval and simply doesn't happen. `--max-turns` caps how long it can run. The PostToolUse lint hook also fires on its edit.

**Effective permissions.** `--allowedTools` only adds grants. It does not remove grants that come from other settings files. Without other flags, a headless run therefore gets the union of `--allowedTools`, this repo's `.claude/settings.json` (the read-only docs tools, `npm test` and `npm run lint`) and the machine's user-level `~/.claude/settings.json`. To limit the run to the intended set and stop personal grants from leaking in, run it with project settings only:

```
claude -p "…same task…" \
  --setting-sources project \
  --allowedTools "Read,Edit(tests/**),Bash(npm test:*)" \
  --max-turns 6
```

With that flag the effective set is `Read`, `Edit(tests/**)`, `Bash(npm test:*)`, plus the project's own read-only `allow` entries. The project `deny` list still applies, and the lint hook still runs on every edit. Any other tool has no grant, so in an unattended `-p` run it is refused rather than prompted.

**Run.** I ran exactly this command from the root of a fresh clone. Claude read the route and the existing tests, added the test *"PUT /users/:id returns 400 when neither name nor email is sent"* in `tests/users.test.js`, and ran `npm test`, which passed 6 of 6. Afterwards I reverted the change, because the run was a demonstration.

That run used the default setting sources. In a different headless run on the same machine, Claude used `cat` through Bash even though it wasn't in that run's `--allowedTools`. My user-level settings allowed it. That is exactly the leak `--setting-sources project` closes, and it is why the version with that flag is the one to use unattended.
