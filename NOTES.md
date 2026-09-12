# Notes

## 1. The server

**`fetch-docs`** (`@tokenizin/mcp-npx-fetch@1.0.0`), project scope in `.mcp.json`. No credentials, so nothing secret is committed; version pinned so everyone resolves the same build. Useful here because the tests run on the Node.js test runner and the routes are Express — current reference documentation can be consulted rather than recalled.

**Permission rule** (`.claude/settings.json`): only the three read-only tools actually used are allowed — `fetch_markdown`, `fetch_txt`, `fetch_json` — not the server as a whole. Repository-modifying tools (`Edit`, `Write`, commits, pushes, installs) sit under `ask`, which outranks `allow` and survives `acceptEdits`; `.env*` is denied.

Example: Add centralized error-handling middleware to the Express API.
Before implementing it, check the current Express documentation for error-handling middleware.

## 2. The skill

**`error-responses`** (`.claude/skills/error-responses/SKILL.md`) records the convention followed in `routes/users.js` but written down nowhere: `return res.status(<code>).json({ error: <message> })`, `400` for bad input, `404` for a missing record. Its core is a dictionary — the three messages that exist verbatim in the code, plus templates and wording rules for new ones — with the conventions that validation belongs in the route, not `db/store.js`, and that body checks precede the lookup.

The description names concrete triggers (adding a route, adding validation, returning a 400/404) rather than the topic in the abstract, so it does not fire on general Express questions. Confirmed by the headless run in section 5, which selected it unprompted.

Example: Validate the email field on POST /users and return 400 when it is not a valid address.

## 3. The command

**`/new-route <resource> [fields]`** (`.claude/commands/new-route.md`), `$1` the plural resource, `$2` the required create fields. It scaffolds the resource end to end: store helpers, router, mount, tests for every error branch, a `docs/api.md` entry, then `npm test` and `npm run lint`. Worth a shortcut because a new route touches five files, and the steps most often skipped — error-branch tests and the docs entry — are the ones it makes mandatory. Error wording is delegated to the skill rather than duplicated.

Example: /new-route posts title,body
Scaffolds the resource end to end: `createPost`/`getPost` helpers in the store, `routes/posts.js`, the mount in `server.js`, tests for the `400` and `404` branches, and the `docs/api.md` entry.

## 4. The hook

A **PreToolUse** hook on the **Bash** matcher running `.claude/hooks/block-risky-bash.js`. It prevents rather than reacts — nothing is left to react to once an irreversible command has run — and blocks only what re-running cannot undo: recursive force-deletes, force pushes, hard resets, forced cleans, `npm publish`. Node rather than `jq`, which is absent here. Narrower than the `ask` rules on purpose: `ask` can be cleared by confirming, `deny` cannot.

Example: Clear out the logs directory with `rm -rf logs`
The hook denies it before the Bash tool runs, answering with the script's own reason: *Recursive force-delete (rm -rf) is blocked on this project. Delete specific paths instead.*

## 5. The headless run

Example: claude -p "Add a test for the /users endpoint" --allowedTools "Read,Edit,Write,Bash(npm test)"

I allowed only Read, Edit, Write, and Bash(npm test), so Claude could inspect, modify, and test the code without access to arbitrary shell commands.
