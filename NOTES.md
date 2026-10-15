# NOTES.md

## 1. Server (MCP)

Connected the `@modelcontextprotocol/server-filesystem` server pointed at `./docs`. This is useful because `docs/api.md` contains the full API reference — endpoints, request/response shapes, error formats — and Claude can read it directly instead of having to grep through source code. No credentials required, works on a fresh clone.

The permission rule in `.claude/settings.json` allows only `mcp__project-docs__read_file` and `mcp__project-docs__list_directory`. That keeps it strictly read-only and scoped to what the server actually needs — no blanket server allowance.

I used it headlessly to list all endpoints (see task 5).

## 2. Skill

The skill in `.claude/skills/add-route/SKILL.md` captures the pattern every new route follows: `express.Router()`, `require('../db/store')`, the `400`/`404`/`201` status codes, the `{ "error": "message" }` error shape, and the matching test file with `beforeEach(() => store.reset())` + supertest.

The description reads: *"Use this skill when the user asks to add a new route, endpoint, or REST resource to the project."* The phrase "to the project" keeps it from triggering on generic Express questions. I tested it by asking "add a products route" without mentioning the skill, and it fired.

## 3. Command

`/scaffold-route <resource>` generates both the route file and the test file for a new resource in one shot. It's worth a shortcut because adding a route is the single most repeated task on this project, and getting the status codes, error shape, and test structure wrong is easy. The command wires in `$ARGUMENTS` so you pass the resource name inline: `/scaffold-route orders`.

## 4. Hook

Set a `PostToolUse` hook that matches `Edit|Write` and runs `npm run lint`. It reacts rather than prevents — ESLint runs after every file write and its output is surfaced in the session. The choice to react (not block with `PreToolUse`) means Claude can still finish the edit; the lint output is immediate feedback, not a hard gate. This enforces the project's ESLint rules automatically for every teammate running Claude on the repo.

## 5. Headless task

```bash
claude -p "Read docs/api.md and list all endpoints with their HTTP method and path." \
  --allowedTools "mcp__project-docs__read_file,mcp__project-docs__list_directory"
```

Task: summarise the API from the spec file. Locked down to the two read-only MCP tools — no shell access, no file writes, no network beyond the docs server. Well-scoped because the input (the spec file) and the output (a list of endpoints) are both bounded.
