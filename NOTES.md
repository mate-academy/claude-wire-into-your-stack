# Notes

## Server and permission rule

I connected a small local MCP server, `docs-readonly` (`mcp-docs-server/server.js`, registered in `.mcp.json`). It exposes two tools, `list_docs` and `read_doc`, over the `docs/` folder. It is useful here because the API reference lives in `docs/api.md`, and Claude can now read it on demand without me pasting it in or giving it broad filesystem access. The permission rules in `.claude/settings.json`, `mcp__docs-readonly__list_docs` and `mcp__docs-readonly__read_doc`, allow exactly those two tools without prompting. Both tools are read-only and the server rejects any path outside `docs/`, so everything else still asks first.

## Skill

The skill `add-endpoint` (`.claude/skills/add-endpoint/SKILL.md`) captures the workflow that repeats every time this API grows: store helper in `db/store.js`, one route file mounted in `server.js`, validation with `400`/`404` and `{ "error": ... }`, tests, an update to `docs/api.md`, then `npm test` and `npm run lint`. Its description is worded to fire only on API work: it says to use it when the request is to create a route or resource, add a method to a route file, or change an endpoint's behavior, names the files involved, and says not to use it for general questions or non-API work.

## Command

I added `/sumarize <source-file> <destination-file>` (`.claude/commands/sumarize.md`). It reads one file and writes a Markdown summary to another, never touching the source and asking before overwriting. It is worth a shortcut because it is a task I repeat with the same shape and two inputs, and the command fixes the steps, the arguments and the safety rules (only Read and Write allowed) so I don't re-explain them each time.

## Hook

I set a `PostToolUse` hook with the matcher `Edit|Write` that runs Prettier on the file Claude just changed (`.claude/hooks/format.js`). It reacts rather than prevents: it runs after the edit has happened and cleans up formatting, so it cannot stop the edit itself. If Prettier is missing or fails (for example on a syntax error), the hook exits with code 2 and prints the reason, so Claude sees that the file was not formatted instead of the failure passing silently. It makes formatting automatic instead of something I have to remember to ask for.

## Headless and lock-down

I ran Claude Code headless with `claude -p "List the files in the docs server and summarize api.md" --allowedTools "mcp__docs-readonly"`. It listed the one file in `docs/` (`api.md`) and returned an accurate summary (base URL, the health endpoint, and the four users endpoints, noting there is no DELETE), with no prompts. That confirms the server connects and its tools work end to end. Earlier, `claude mcp list` is how I found and fixed an invalid `.mcp.json`.

What I locked down: `--allowedTools` limited the run to that one server's tools, so a headless run could not edit files or run shell commands. The server itself is read-only, confines itself to `docs/` (including symlink checks) and caps file size at 1 MB. The standing permission rules in `.claude/settings.json` name those two tools individually, and `/sumarize` is limited to the Read and Write tools.
