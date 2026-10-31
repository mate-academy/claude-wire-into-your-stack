# NOTES — wiring Claude into the Course API

Setup on a fresh checkout: `npm install` (the lint hook uses the project's ESLint), then start
`claude` in the repo. The `docs` MCP server is pre-approved via `enabledMcpjsonServers`.

## 1. Server (MCP)

**What:** the official filesystem server (`@modelcontextprotocol/server-filesystem@2.1.0`), registered as
`docs` in a committed `.mcp.json`. Its only allowed root is `./docs`.

**Why here:** `docs/api.md` is the source of truth for the API contract. Every route change has to match it
and update it, so Claude needs to look things up there often. The server needs no credentials, the version
is pinned so teammates get the same thing, and it can't see anything outside `docs/`.

**Permission rule:** `permissions.allow` lists only the read tools Claude actually uses:
`list_allowed_directories`, `read_text_file`, `read_multiple_files`, `list_directory` and `search_files`.
The server isn't blanket-allowed (`mcp__docs`), and the write tools (`write_file`, `edit_file`,
`move_file`, `create_directory`) are explicitly in `permissions.deny`. Claude edits the docs with its normal,
reviewable Edit tool, not through the server.

**Used it:** I asked Claude to list every endpoint in `api.md` through the server. It called
`mcp__docs__list_allowed_directories` and then `mcp__docs__read_text_file`, and returned the five documented
endpoints.

## 2. Skill: `add-api-route`

**What it captures:** the five steps every endpoint in this repo follows. Data goes through a
`db/store.js` helper that returns `undefined` rather than throwing. The handler gets a
`// METHOD /path — …` comment, `400`/`404` checks, `{ error }` JSON and `return res…`. New routers are mounted
in `server.js`. Tests use node:test with supertest and `store.reset()`. Finally there's a `docs/api.md`
entry, with lint and tests passing.

**Description wording:** it names the concrete trigger nouns and verbs (add, create, implement or modify an
*endpoint, route or resource*), includes the HTTP methods and two example requests, and ends with an
explicit "Not for unrelated refactors, tooling or config changes" so it doesn't fire on every edit.

**Confirmed:** the prompt "Add a DELETE /users/:id endpoint…" (without naming the skill) called
`Skill(add-api-route)` first. Claude then planned the change across store, route, tests and docs, with
`204` on success and `404` for a missing user.

## 3. Command: `/review-conventions [ref-range]`

**What:** reviews uncommitted changes (or `git diff $ARGUMENTS`, e.g. `/review-conventions main...HEAD`)
against the CLAUDE.md conventions as an 8-item ✅/❌ checklist. It runs `npm run lint` and `npm test` and
ends with a Ready / Needs changes verdict. It's read-only: its `allowed-tools` frontmatter only allows
git read commands, the two npm scripts, and Read/Grep/Glob.

**Why a shortcut:** it's the check I'd otherwise retype before every commit or PR, and keeping the checklist
in one file means everyone reviews against the same list.

## 4. Hook: lint every edited JS file (react, `PostToolUse`)

**Event:** `PostToolUse`, because the point is to check every edit as it lands, not to block it.
**Matcher:** `Edit|MultiEdit|Write`.
**Command:** `node .claude/hooks/lint-edited-file.js`. It runs `eslint --fix --max-warnings=0` on just the
edited `.js` file. If problems remain, it exits `2` with the ESLint report on stderr, so Claude sees it
and fixes the file right away instead of waiting for CI. It ignores non-JS files, `node_modules` and paths
outside the project, and skips without failing if ESLint isn't installed. I wrote it in Node rather than
bash + `jq` because Node is the one tool every contributor already has.

**Seen firing:** Claude wrote `routes/hook-demo.js` containing `module.exports = undefinedThing;` and got
`PostToolUse:Write hook blocking error … 'undefinedThing' is not defined no-undef` back. The scratch file
was then deleted.

## 5. Headless run

```bash
claude -p "/review-conventions" \
  --allowedTools "Read,Grep,Glob,Bash(git diff:*),Bash(git status:*),Bash(npm test),Bash(npm run lint)"
```

**Allowed:** reading the repo, git *read* commands, and exactly the two npm scripts the review needs.
**Locked down:** no Edit or Write, no arbitrary Bash, no network. A review run with nobody watching
shouldn't be able to change anything. The run proved the scoping works: Claude tried two compound shell
commands (a `cat` loop and a piped `npm run lint | tail`), both were denied, and it fell back to `Read`
and the exact allowed commands. It still finished: lint clean, 5/5 tests passing, verdict **Ready**.
