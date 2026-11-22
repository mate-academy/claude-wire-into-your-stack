# Notes

## Server

The project MCP server is `docs`: a filesystem server pointed at this repo's `docs/` folder.

That folder is the API reference for this app, so Claude can list and read it without opening the rest of the tree.

The allow-rule in `.claude/settings.json` covers only the read tools: `read_file`, `list_directory`, `directory_tree`, `get_file_info`, and `search_files`. Write and move stay off the allow list.

I used it once by asking Claude to summarise `docs/api.md` from the MCP server. It listed `docs/`, then read the file, and the users and health endpoints matched what is in the repo.

## Skill

The skill is `resource-route`.

This project always adds an HTTP resource the same way: one router file, store helpers, tests, `400`/`404` as `{ "error": "message" }`.

The description names resource, route, endpoint, and the HTTP verbs, so it fires on those requests without being named.

I asked Claude to add a notes resource, without saying the skill name. It loaded `resource-route` and followed `routes/users.js` instead of inventing a new layout.

## Command

The command is `/new-resource`.

Scaffolding a resource is the prompt I would repeat on this API. The name goes in `$ARGUMENTS`.

I ran `/new-resource notes`. It asked when the name was missing, and with the name it added store helpers, a router, a mount, tests, and a docs section, then stopped.

## Hook

The hook is PostToolUse on Write and Edit. It reacts after the edit; it does not block the tool.

The command is `npm run lint`, which is this repo's lint script.

I triggered it by editing a route file. Lint ran after the write and reported the same result as `npm run lint` from the project root.

## Headless

I ran one headless task: summarise the users API from `docs/api.md`.

```
claude -p "Summarise the users API from docs/api.md" --allowedTools "mcp__docs__read_file,mcp__docs__list_directory,Read"
```

Allowed: the two MCP read tools needed to open the reference, plus Read as a fallback. No Bash, no Write, no Edit.

It printed a short summary of list, get, create, and update, and did not ask for further tools.
