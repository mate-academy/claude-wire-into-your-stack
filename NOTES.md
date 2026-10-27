# NOTES.md

## 1. MCP Server Connected
Connected the **fetch MCP server** (`mcp-server-fetch` via `uvx`) at project scope in `.mcp.json`. It's useful for pulling external API references, documentation, or any HTTP resource during development. The permission rule in `.claude/settings.json` allows only `mcp__fetch__fetch` — the single read-only fetch tool — rather than blanket-allowing the entire server.

## 2. Project Skill
Created `.claude/skills/course-api.md` capturing the project's repeated patterns: route file structure (one per resource), store-only data access, validation conventions (400/404), error format (`{ "error": "..." }`), test structure with `beforeEach(store.reset())`, and the checklist for adding new resources. The description "This skill encodes the recurring patterns in the Course API project so new work follows the established conventions" makes it fire when working on this codebase.

## 3. Custom Commands
Added three commands in `.claude/commands/`:
- `/scaffold-route` — scaffolds a complete new resource (route, store, tests, mount)
- `/review-checklist` — reviews changes against all project conventions
- `/summarize-changes` — summarizes git diffs with test/lint status
The scaffold command is worth a shortcut because adding a resource touches 4+ files with boilerplate that must follow exact conventions.

## 4. Hook
Added a **PostToolUse** hook on the `Edit` matcher that runs `npm run lint` after every edit. It **reacts** (doesn't prevent) — runs linting automatically after changes so style issues are caught immediately without manual invocation.

## 5. Headless Run
Ran two headless tasks via `claude -p`:
- `npm test` — allowed tools: `Bash, Read` (execute test runner, read output)
- `npm run lint` — allowed tools: `Bash` (execute linter only)
Locked down by pre-approving only the exact tools each task needs — no file edits, network calls, or other side effects possible.