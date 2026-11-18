# How Claude is wired into this repo

Everything below is committed. Anyone who clones the branch gets the same setup. The app's behaviour is unchanged.

| Piece | File |
|-------|------|
| MCP server | `.mcp.json` (permission rule in `.claude/settings.json`) |
| Skill | `.claude/skills/api-endpoint/SKILL.md` |
| Command | `.claude/commands/check-conventions.md` |
| Hook | `.claude/settings.json` → `.claude/hooks/lint-edited-file.js` |

## 1. Server: `docs` (official MCP filesystem server, sandboxed to `docs/`)
I connected `@modelcontextprotocol/server-filesystem@2.2.0` at project scope, pointed at `./docs`:

```
claude mcp add docs --scope project -- npx -y @modelcontextprotocol/server-filesystem@2.2.0 ./docs
```

`docs/api.md` is this API's contract. Giving Claude a dedicated, sandboxed way to read it makes "does the code still match the docs?" a one-step question.

**Why this server:**
- It needs no credentials and runs on Node, which every contributor already has. The Python fetch server would need `uv`, which isn't installed here.
- The server itself refuses any path outside `docs/`.
- The version is pinned to a release that's a couple of weeks old, so a teammate's checkout doesn't silently pull whatever was published that morning.

**What the permission rule allows:** `permissions.allow` lists only the two read-only tools I actually use, `mcp__docs__read_text_file` and `mcp__docs__list_directory`. The server also exposes `write_file`, `edit_file`, `move_file` and other write tools. Those are **not** allowed, so they still prompt.

**Used once:** in a headless docs-drift check (see 5). Claude read `api.md` through `mcp__docs__read_text_file` and compared it with the routes.

**On first launch:** each teammate approves `docs` once when they first run `claude` here. That's Claude Code's trust prompt for project servers, and I deliberately didn't bypass it in committed settings.

## 2. Skill: `api-endpoint`, the route recipe
**What it captures:** the way every endpoint here is built:
1. A `db/store.js` helper first, so routes never hold state.
2. The router in `routes/<resource>.js`, mounted in `server.js`.
3. `400` on bad input, `404` on a missing record, and errors always as `{ "error": "message" }`.
4. `node:test` + supertest tests with `store.reset()` in `beforeEach`.
5. A `docs/api.md` entry.
6. Finally `npm run lint && npm test`.

The code templates come from the real `users.js` and `users.test.js`.

**How the description fires:** it opens with the trigger ("adding, changing or removing an HTTP endpoint or route in this Course API") and names the folders involved. It quotes realistic requests such as "add a DELETE /users/:id endpoint" and "make PUT /users validate email". It ends with an explicit "do not use" for questions, explanations and non-route changes.

**Checked both ways, in a throwaway worktree:**
- "Add a DELETE /users/:id endpoint." → `Skill api-endpoint` was the **first** tool call. Claude followed every step, and lint and tests passed.
- "What does GET /health return?" → the skill did **not** fire.

## 3. Command: `/check-conventions [paths]`
It reviews the branch diff plus uncommitted work, or the paths you pass via `$ARGUMENTS`, against the seven conventions in `CLAUDE.md`:
- one router per resource
- no state in routes
- `400` on bad input
- `404` on missing records
- the `{ error }` shape
- tests
- docs

It returns `Verdict: READY | NEEDS CHANGES`, a PASS/FAIL table with `file:line` evidence, and ordered fixes.

**Why it's worth a shortcut:** this is the review to run before every PR on this repo. The command's `allowed-tools` is limited to `git diff`, `git status`, `Read`, `Grep` and `Glob`, so it can never edit anything.

**Ran once:** `/check-conventions routes/users.js` produced the table as designed. It flagged missing `POST`/`PUT` 400 tests, no JSON error handler for malformed bodies, and loose `PUT` validation. The output format held, so I didn't need to adjust the prompt.

One caveat: one claim in that output was overstated. It said `req.body` can be `undefined`, but on Express 4.22 body-parser defaults it to `{}`. The command gives a reviewer a starting point; it doesn't replace the reviewer.

## 4. Hook: PostToolUse → ESLint on the edited file (reacts)
**The three choices:**
- **Event:** `PostToolUse`. The hook reacts after a file is written.
- **Matcher:** `Edit|Write|MultiEdit`. Only tools that change files.
- **Command:** `node "$CLAUDE_PROJECT_DIR/.claude/hooks/lint-edited-file.js"`.

**What the script does:**
- It lints only the `.js` file that was just edited, using the project's own ESLint config.
- It ignores non-JS files, files outside the repo and `node_modules`.
- If ESLint isn't installed yet, it skips with a note.
- On errors it exits `2`, so the ESLint output goes straight back to Claude, which fixes it in the same turn.

**Why this standard:** CI fails on lint (`.github/workflows/ci.yml`), so the hook enforces that standard at edit time instead of after a push. I chose a Node script over `jq`/`bash` because every contributor already has Node.

**Triggered on purpose:** I wrote `routes/_hook-demo.js` containing `module.exports = notDefinedAnywhere;`. The hook blocked with `'notDefinedAnywhere' is not defined (no-undef)`. Then I deleted the file.

## 5. Headless: docs-drift check with read-only tools
```
claude -p "Using the docs MCP server (mcp__docs__* tools), read api.md, then compare it against routes/*.js and server.js in this repo. Report every drift between the documented API and the code ... Do not edit any files." \
  --mcp-config .mcp.json \
  --allowedTools "mcp__docs__read_text_file,mcp__docs__list_directory,Read,Grep,Glob"
```

**What I allowed and why:**
- The two docs MCP read tools, to read the contract.
- `Read`, `Grep` and `Glob`, to read the code.

**What's locked down:** no `Bash`, `Edit`, `Write` or `WebFetch`. With nobody watching, the worst this run can do is read files.

`--mcp-config .mcp.json` is passed explicitly because a headless run can't answer the one-time approval prompt for project servers.

**Result:** `docs: connected`, 0 permission denials, and no files changed. The endpoints, status codes and error shape match the docs. The drift it found is all in edge cases: `PUT` accepts empty strings, while `POST` rejects them. Malformed JSON bodies get Express's default error page instead of `{ "error": ... }`. These are worth a follow-up PR, but they're out of scope for this wiring-only branch.

## Verify on a fresh checkout
1. Run `npm ci`.
2. Run `claude` and approve the `docs` server. `/mcp` should show it connected.
3. Ask Claude to "add a DELETE /users/:id endpoint" and watch `api-endpoint` load.
4. Run `/check-conventions`.
5. Ask Claude to write a `.js` file with an undefined variable and watch the hook block it.
