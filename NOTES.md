# NOTES — wiring Claude into the Course API

## 1. Server (MCP)

**What:** `docs` — the official filesystem server (`@modelcontextprotocol/server-filesystem`) pointed at `./docs`, committed at project scope in `.mcp.json`. It needs no credentials, and it runs on Node through `npx`, which the project already requires.

**Why it helps:** `docs/api.md` is the contract for this API. Claude reads it through the server to check that routes and docs agree — the `/review-conventions` command and the headless drift check both do this.

**Permission rule** (`.claude/settings.json`):
- `allow` lists only the read-only tools: `read_text_file`, `read_multiple_files`, `list_directory`, `search_files`, `list_allowed_directories`.
- `deny` lists the tools that write: `write_file`, `edit_file`, `create_directory`, `move_file`. The docs are edited through normal, reviewable edits, not through the server.
- `enabledMcpjsonServers: ["docs"]` switches the server on for everyone who clones the repo, without a prompt.

**Used on a real task:** I compared `api.md` with `routes/users.js`. There's no contradiction, but the docs don't cover some edge cases:
- a non-numeric id returns `404`, where the project rule says bad input should get `400`;
- `PUT` accepts `""` and `null`, which `POST` rejects.

**Gotcha:** paths are resolved from the project root, so the file is `docs/api.md`, not `api.md`.

## 2. Skill — `add-api-endpoint`

**What it captures:** the repeated way this project adds or changes an endpoint:
1. data goes through a helper in `db/store.js`, and new data is reset in `seed()`;
2. one route file per resource, mounted in `server.js`;
3. `400` for bad input, `404` for a missing record, errors as `{ error }`;
4. `node:test` + supertest tests with `store.reset()`;
5. a section in `docs/api.md`;
6. `npm run lint` and `npm test` before reporting done.

**How the description is worded:** it names the trigger ("adding or changing an HTTP endpoint or resource in this Express Course API"). It gives realistic example requests ("add a DELETE /users/:id route", "add a /posts resource") and lists what the skill covers. It also says what it is *not* for: general questions, refactors of non-route code, lint or config changes.

**Checked** (skill not named in any prompt):
- "Add a DELETE /users/:id endpoint…" → fired.
- "We need a way to store blog posts with a title and body via the API" → fired, even without the words "endpoint" or "route".
- "What does npm run lint check?" → did not fire.

## 3. Command — `/review-conventions [ref]`

**What it does:** reviews changes against the CLAUDE.md checklist:
- store-only data access;
- one route file per resource;
- `400` / `404`;
- the `{ error }` shape;
- tests;
- docs, read through the `docs` server.

With no argument it reviews uncommitted changes. With `$ARGUMENTS` it reviews a ref or range, e.g. `/review-conventions main...HEAD`. The output is a ✅/❌/➖ table with `file:line` evidence, then a "Must fix" list. `allowed-tools` limits it to git diff/log/status and read tools, so the review never edits anything.

**Why it's worth a shortcut:** it's the check I'd run before every PR. Saving it keeps the checklist the same for everyone instead of being retyped from memory.

**Checked:** I added a deliberately broken `DELETE` route, left uncommitted and reverted afterwards. The command flagged every problem:
- state kept in the route file;
- always returns `404`;
- a plain-text error;
- no tests;
- no docs.

**Gotcha:** from Git Bash on Windows, `claude -p "/review-conventions"` gets turned into a file path. Prefix it with `MSYS_NO_PATHCONV=1`. Interactive use is unaffected.

## 4. Hook — PreToolUse guard (prevents)

**Event:** `PreToolUse`, so risky actions are stopped *before* they run, not cleaned up afterwards.

**Matcher:** `Bash|Edit|Write`.

**Command:** `node "$CLAUDE_PROJECT_DIR/.claude/hooks/guard.js"`. It's a Node script, so it behaves the same on Windows, macOS and Linux. It exits with code `2` and a reason, which cancels the tool call and tells Claude why.

**What it blocks:**
- `git push --force` and `-f` (`--force-with-lease` is allowed);
- `git reset --hard`;
- `rm -rf` and `rm -fr`;
- any Edit or Write to `.env` or `.env.*` files (`.env.example` is allowed).

**Checked:**
- 13 sample inputs, both blocked and allowed, all correct.
- It fired live in my own session when a test command merely contained a force-push string.
- A fresh `claude -p` session asked to write `.env`, with `Write` pre-approved, was blocked, and no file was created.

## 5. Headless run — docs drift check

```sh
claude -p "Docs drift check. Read docs/api.md ONLY via the docs MCP server (mcp__docs__read_text_file, path docs/api.md), read server.js and routes/*.js with Read, and run npm test to confirm behaviour. Report in a table every endpoint: documented vs implemented status codes, marking MATCH or DRIFT, then the npm test pass/fail count. Keep it under 25 lines. Do not edit files." \
  --allowedTools "Read Grep Glob mcp__docs__read_text_file Bash(npm test) PowerShell(npm test)" \
  --output-format json
```

**What I allowed and why:**
- read-only code tools: `Read`, `Grep`, `Glob`;
- the one MCP tool the job needs: `mcp__docs__read_text_file`;
- exactly `npm test`, in both its Bash and PowerShell forms.

**What's locked down:** there's no Edit or Write, no git, no other shell command, and no other MCP tool. It's safe to run unattended, for example on a schedule or in CI.

**Result:** every endpoint MATCH, 5/5 tests passing, 8 turns, `permission_denials: []`, and the working tree unchanged.

**Lesson:** the first run allowed only `Bash(npm test)`. On Windows, Claude ran the tests through the `PowerShell` tool instead. That call was denied and Claude didn't try to get around it, which showed the scoping works. It also showed that a cross-platform allowlist needs both shell forms.
