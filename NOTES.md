# NOTES

## Server (MCP)

Connected `docs`, the official `@modelcontextprotocol/server-filesystem`, scoped to the `docs/` directory only (`.mcp.json`, project scope). It's useful here because `docs/api.md` is the source of truth for the API's endpoints, response shapes, and status codes — letting Claude read it directly means it can check or update the docs without me pasting the contents into the conversation, and it can't touch anything outside `docs/`. The permission rule in `.claude/settings.json` allows only the read-only tools (`read_text_file`, `read_multiple_files`, `list_directory`, `directory_tree`, `search_files`, `get_file_info`, `list_allowed_directories`) and explicitly denies `write_file`, `edit_file`, `create_directory`, and `move_file`, so the server can inform Claude but never modify the docs on its own.

## Skill

`scaffold-rest-resource` (`.claude/skills/scaffold-rest-resource/SKILL.md`) captures this repo's fixed recipe for adding a new REST resource: a collection + CRUD helpers in `db/store.js`, a router in `routes/<resource>.js` with the project's validation/error conventions (`400`/`404`, `{ "error": "message" }`), mounting in `server.js`, a test file mirroring `tests/users.test.js`, and a docs section matching `docs/api.md`. The description names the trigger explicitly ("adding a brand-new REST resource/endpoint... e.g. add a /products route") and an explicit non-trigger ("Do not use for editing an existing route's behavior"), so it fires on new-resource requests and stays out of the way otherwise. Confirmed by asking for a "products" resource without naming the skill — Claude invoked it by name and produced a plan matching the recipe exactly.

## Command

`/verify` (`.claude/commands/verify.md`) runs `npm test` then `npm run lint`, the two checks I'd otherwise run manually before considering any change done. It's worth a shortcut because the value isn't just running the commands — it's in how the output gets reported: pass/fail per check, and on failure the specific file/line and rule/test name pulled out of the raw output plus a suggested minimal fix, without touching any code. Ran it headless once and confirmed it correctly diagnosed a missing `node_modules` install (dependencies not present) instead of just dumping the npm output.

## Hook

A `PostToolUse` hook on the `Edit|Write` matcher (`.claude/settings.json` → `.claude/hooks/lint-fix.sh`) runs `eslint --fix` on any `.js` file Claude just edited or wrote. It reacts rather than prevents, because lint violations here are cheap to fix after the fact and auto-fixing keeps the "clean lint" standard from CLAUDE.md holding without anyone having to remember to run it. Verified by deliberately writing a file containing `if (!!x)` (a redundant double-negation ESLint flags and can auto-fix) and confirming the hook rewrote it to `if (x)` and the file lint-passed afterward.

## Headless task

Ran `/verify` headless via `claude -p "/verify" --allowedTools "Bash(npm test)" "Bash(npm run lint)"`. Locked it down to exactly those two Bash invocations — no edit/write tools, no broader Bash access, no MCP tools — since the task is read-only reporting and shouldn't be able to change anything or run arbitrary commands, even unattended.
