# NOTES: Wiring Claude into the Course API

## Server and permission rule

I connected a filesystem MCP server (`@modelcontextprotocol/server-filesystem`) at project scope, pointed at `./docs`, so it can read `docs/api.md`. It is credential-free and committed in `.mcp.json`. The path is relative so the config works on any clone.

The permission rule in `.claude/settings.json` allows only the three read tools: `read_text_file`, `list_directory`, and `search_files`. The server's write tools (`write_file`, `edit_file`, `move_file`, and so on) are not allowed, so Claude has to ask before using them. I used the server once for a real task: listing the endpoints documented in `docs/api.md`. The answer matched the file.

## Repeated way of working: the skill

The skill is `.claude/skills/add-route/SKILL.md`. It captures the route pattern in `CLAUDE.md` and `routes/users.js`: one router per resource, mounted in `server.js`, data only through `db/store.js`, validation with `400`, `404` for missing records, and a supertest file for each resource.

The description says when to use it: adding, writing, or scaffolding a new Express route or endpoint. It leads with the action and names the nouns a request would use ("route", "endpoint"). I checked that it fires without being named. Asking for a new `GET /ping` endpoint loaded `add-route` automatically.

## Command

`.claude/commands/review-route.md` is `/review-route <path>`. It reviews a route file against the `CLAUDE.md` checklist and reports pass or fail per rule, with line numbers. It is worth a shortcut because I run this review by hand after every new route. `$ARGUMENTS` takes the file path. I ran it on `routes/users.js`. It reported real gaps: `PUT` and `POST` accept non-string values, non-numeric ids return `404` instead of `400`, and the tests have no `400` case. I did not change the app code, since this project only adds wiring.

## Hook

The hook is a PostToolUse hook in `.claude/settings.json`. It matches `Edit|Write`, and runs `.claude/hooks/lint-edited.js`. This is a react hook, not a prevent hook. Blocking a write would be too strict, because a lint error is normal mid-edit. Instead, the hook lints the edited `.js` file with `--max-warnings 0`. If lint fails, it exits 2, so the ESLint output goes back to Claude and Claude fixes the file on its next step. I tested it on a file with an unused variable (exit 2) and on a clean file (exit 0).

The hook needs dependencies installed (`npm ci`) to run ESLint.

## Headless run

I ran one task with `claude -p`:

    claude -p "Using the filesystem tools, read docs/api.md and list every endpoint it documents as METHOD PATH, one per line. Do not change any files." --allowedTools "mcp__filesystem__read_text_file" "mcp__filesystem__list_directory" "mcp__filesystem__search_files"

I allowed only the three read tools from the MCP server. The task cannot write files, run shell commands, or read `.env`. The `Read(./.env)` deny rule in the settings also stays in place.
