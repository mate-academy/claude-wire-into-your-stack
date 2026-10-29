# NOTES

## Server
Connected the **filesystem MCP server** (`@modelcontextprotocol/server-filesystem`) at project scope as `docs`, restricted to `./docs`. It needs no credentials and gives Claude structured access to the API documentation. The permission rule allows only read-only tools: `read_text_file`, `list_directory`, `search_files`. No write tools are pre-approved. It launches via `npx`; on native Windows it may need a `cmd /c npx` wrapper.

## Skill
`express-route` captures how a route is written here: one file per resource, access through `db/store.js`, 400/404 validation, `{ "error": ... }` responses, and tests. The description lists the triggering situations (adding or changing an Express route/endpoint/validation/error response) and stays away from unrelated work, so it fires on "add a DELETE /users/:id" without being named.

## Command
`/review-api [focus]` reviews the working-tree diff against the project checklist. It is worth a shortcut because the same review runs before every commit; `$ARGUMENTS` optionally narrows it. It is read-only.

## Hook
A **PostToolUse** hook on `Edit|Write` that runs `eslint --fix` on edited JS files in the linted folders. It reacts after the edit (auto-formats) and, if errors remain, exits 2 so Claude sees them and fixes them. This keeps the lint standard holding every time.

## Headless
```
claude -p "Summarise the endpoints in routes/ as a markdown list" --allowedTools "Read,Glob,Grep"
```
Only read-only tools are allowed: with nobody watching, the run cannot edit files or run shell commands.
