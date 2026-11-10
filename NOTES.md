# NOTES

**Server (MCP).** I connected `fetch` (`uvx mcp-server-fetch`) at project scope in `.mcp.json`. It needs no credentials and lets Claude pull in API references (e.g. Express docs) while working on routes. The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch`, the one read-only tool I use, instead of blanket-allowing the server.

**Skill.** `add-route` captures how routes are written here: one router per resource mounted in `server.js`, data only via `db/store.js`, `400`/`404` validation, `{ "error": "message" }` responses, a supertest test, and a `docs/api.md` update. The description lists concrete triggers (adding or changing an endpoint, handler, or `/resource` path) and says it is not for general questions, so it fires on route work without being named.

**Command.** `/review-routes [file or ref]` reviews a diff against the CLAUDE.md conventions and returns PASS/FAIL with `file:line`. It is worth a shortcut because I run the same checklist before every PR. It is read-only.

**Hook.** A `PreToolUse` hook with matcher `Bash` runs `.claude/hooks/guard-bash.js`. It prevents rather than reacts: it blocks force-pushes, pushes to main/master, and recursive `rm` on root/home/cwd (exit code 2, with the reason sent back to Claude).

**Headless.** I ran `claude -p "<read the Express res.status/res.json docs via fetch and summarise>" --allowedTools "mcp__fetch__fetch" --max-turns 8`. Only the single read-only fetch tool was pre-approved: no Edit/Write and no Bash, so an unattended run cannot change the repo or run commands, and `--max-turns` bounds it. This run was also the real use of the MCP server.

## Verification
- MCP: fetch returned the Express docs in a headless run.
- Skill: I asked to add `GET /products` without naming the skill. The answer followed the add-route steps (store-only access, JSON error shape, supertest test, `docs/api.md` update) and cited the skill. The stream showed no explicit `Skill` tool_use event, so the evidence is the content of the answer.
- Command: `/review-routes routes/users.js` returned a PASS/FAIL table with `file:line`.
- Hook: `git push --force --dry-run` was blocked by `guard-bash.js` (exit 2) before git ran.
