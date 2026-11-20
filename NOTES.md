# NOTES

## 1. MCP server
I connected `@modelcontextprotocol/server-filesystem` at project scope (`.mcp.json`) and pointed it only at `./docs`. It needs no credentials. Claude can read the API reference (`docs/api.md`) as a source of truth and check it against the code in `routes/`. In `.claude/settings.json`, `permissions.allow` lists only the read-only tools: `mcp__docs__read_text_file`, `mcp__docs__list_directory` and `mcp__docs__search_files`. Write tools (`write_file`, `edit_file`, `move_file`) still need confirmation. First real use: a docs-vs-code comparison. It found edge cases: a non-numeric id returns 404, PUT accepts `null` or `""`, and parse errors come back as HTML instead of JSON.

## 2. Skill — `express-route`
It captures the repo's repeated workflow for adding or changing an endpoint: helpers in `db/store.js` → a router in `routes/<resource>.js` → mounting in `server.js` → 400/404 with `{ "error": "..." }` → a node:test + supertest test with `store.reset()` → a section in `docs/api.md` → `npm test` / `npm run lint`. The description names the trigger (adding or changing an HTTP endpoint/route/resource) and gives sample phrasings. It also excludes refactors, lint fixes and non-HTTP code. Check: I asked "I need a DELETE endpoint for users" without naming the skill, and Claude invoked `Skill(express-route)` on its own.

## 3. Command — `/review [target]`
It reviews against the checklist from CLAUDE.md: one route per file, data only through the store, 400/404, the JSON error shape, tests, and up-to-date docs. `$ARGUMENTS` is the target: empty means uncommitted changes, a ref means a diff against it, a path means one file. Output is a ✅/❌ table with `file:line`, with no edits. It replaces the same long prompt before every PR. Run: `/review routes/users.js` returned the table and concrete fixes.

## 4. Hook — PreToolUse / Bash guard (prevent)
On the `PreToolUse` event with the `Bash` matcher, the `node .claude/hooks/block-risky-bash.js` script runs. It is Node, so it works the same on Windows, macOS and Linux. It blocks force push, `git reset --hard`, `git clean -f` and `rm -rf` (exit 2, with the reason in stderr). I chose to prevent rather than react because these actions can't be undone after the fact. Check: a Bash call containing a force push was blocked with `Blocked by project hook: "force push"...`. Side effect: the guard matches the whole command string, so even a heredoc whose text merely mentions such a command gets blocked. That is deliberately strict.

## 5. Headless
```
claude -p "Using the docs MCP server, read api.md and compare it against routes/users.js and routes/health.js. List any mismatches ... Do not edit anything." \
  --allowedTools "mcp__docs__read_text_file,mcp__docs__list_directory,Read,Grep,Glob"
```
Only read tools are allowed: two tools from the docs MCP and Read/Grep/Glob. There is no Edit, Write or Bash, so an unattended run cannot change files or run commands. The result was a mismatch report with `permission_denials: []`, so the allowed set was enough.
