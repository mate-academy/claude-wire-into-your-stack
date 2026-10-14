# NOTES

## Server (MCP)
I connected the official `@modelcontextprotocol/server-filesystem` server, named `docs`, at project scope in `.mcp.json`. It is pointed only at `./docs`, so Claude can read the API reference (`docs/api.md`) without touching code and without any credentials. It is useful here because the reference is the source of truth when I add or check endpoints. The permission rule in `.claude/settings.json` (`permissions.allow`) allows only the read-only tools I use: `mcp__docs__read_text_file`, `mcp__docs__list_directory` and `mcp__docs__search_files`. Write tools such as `write_file` or `edit_file` are not allowed.

## Skill
`.claude/skills/express-route/SKILL.md` captures how a route is written in this project: one router file per resource, mounted in `server.js`; all data through `db/store.js`; validation in the route; `400`/`404` with `{ "error": "message" }`; and tests with supertest plus `store.reset()`. The description names concrete triggers ("adding or changing an API endpoint or resource", a new route file, a GET/POST/PUT/DELETE handler, or its tests) and says what it is not for, so it fires on endpoint work and not on general questions. My first, softer wording did not fire: when I asked "add a DELETE /users/:id endpoint" without naming the skill, Claude just read the code. After I made the description stronger ("MUST be used before implementing, planning or explaining any new or changed API endpoint...") with concrete example requests, Claude picked up `SKILL.md` on that same unnamed request. In headless mode it read the file directly rather than calling the Skill tool.

## Command
`/review-routes [base-branch]` reviews the branch diff against the project's five-point route checklist, runs tests and lint, and reports PASS/FAIL per item without editing files. I ran `/review-routes main` once. It read the diff, ran tests and lint, and gave a PASS/FAIL table (n/a items, since this branch only touches tooling) and concrete fixes; one of them (the `--` before the file path in the hook) I applied. I run this kind of review before every PR, so having the checklist saved means the review is the same every time. The base branch goes in `$ARGUMENTS`.

## Hook
A `PostToolUse` hook with matcher `Edit|Write` runs `.claude/hooks/lint-after-edit.js`. It reacts after Claude changes a `.js` file: it runs `eslint --fix` on that file, and if errors remain it exits with code 2 so the lint output goes back to Claude to fix. I chose PostToolUse because lint needs the edited file to exist, and the matcher limits it to file edits. I added `--` before the file path so a name starting with `-` can't be read as a flag. I triggered it with a file containing an undefined variable and it blocked with the `no-undef` error.

## Headless
Command I use for the headless run:

```
claude -p "Read api.md with the docs server and list the endpoints that are missing a 404 case" \
  --allowedTools "mcp__docs__read_text_file,mcp__docs__list_directory" \
  --permission-mode dontAsk
```

I ran it with `--mcp-config .mcp.json`. It connected to the `docs` server, read `api.md` with `read_text_file`, and correctly reported that `GET /users/:id` and `PUT /users/:id` document a 404. I allowed only the two read-only docs tools, so with nobody watching it cannot run shell commands, edit files or write through the MCP server; anything else is denied rather than prompted.
