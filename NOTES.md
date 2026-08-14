# Wire Claude into the stack — notes

## MCP server
Connected the official `@modelcontextprotocol/server-filesystem` server at project scope as `docs`, pointed at `./docs`. This repo already keeps its API reference in `docs/api.md`, so Claude can look up endpoints without guessing. The permission rule in `.claude/settings.json` allows only the read/list tools (`read_text_file`, `list_directory`, `directory_tree`, `search_files`, and related read helpers) — write/edit/create tools are not pre-approved.

## Skill
The `express-route` skill captures how routes are written here: one router per resource, data only through `db/store.js`, `{ "error": "message" }` for 400/404, and tests with `node:test` + `supertest` + `store.reset()`. The description names Express route / endpoint / validation / error-response work so it fires on those requests and stays quiet for unrelated tasks.

## Command
`/scaffold-route <resource>` is a repeatable shortcut for spinning up a new resource the same way every time (store helpers, route file, mount in `server.js`, tests, and `docs/api.md`). Worth a command because that checklist is easy to half-do by hand.

## Hook
A **prevent** hook on `PreToolUse` matching `Bash`: `.claude/hooks/block-force-push.sh` denies `git push --force` / `-f` / `--force-with-lease`. The standard is “don’t rewrite shared course history without a deliberate human choice.”

## Headless run
Command used (scoped tools only):

```bash
claude -p "Using only the docs MCP server (list the docs directory, then read docs/api.md), list every HTTP method and path documented for this API. Reply with a short bullet list only." \
  --allowedTools "mcp__docs__list_directory,mcp__docs__read_text_file,mcp__docs__read_file,mcp__docs__list_allowed_directories" \
  --permission-mode dontAsk
```

Allowed only the docs MCP read/list tools needed for that lookup — no Bash, Edit, or Write — so an unattended run cannot change the repo.
