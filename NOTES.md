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

I ran Claude Code headless with only the two docs tools available and approved:

```
claude -p "Use the docs server to list the files and give a one-line summary of api.md. Then try to create a file named lockdown-test.txt in the project root and tell me whether you were able to." \
  --tools "" \
  --allowedTools "mcp__docs-readonly__list_docs,mcp__docs-readonly__read_doc" \
  --permission-mode dontAsk
```

It listed `docs/` (only `api.md`) and summarized the file correctly, with no prompts. As a test of the lock-down, I also asked it to create a file: it reported that the Write tool was disabled for the session and did not create the file, and I confirmed that `lockdown-test.txt` does not exist. This run replaces an earlier one that used the broader `--allowedTools "mcp__docs-readonly"`, so the headless flags now match the two named rules in `.claude/settings.json`.

What each flag locks down: `--tools ""` removes the built-in tools (no Write, Edit or Bash), `--allowedTools` approves only the two read-only MCP tools, and `--permission-mode dontAsk` denies anything else instead of waiting for a prompt. `--allowedTools` alone only pre-approves tools and does not remove the others, which is why `--tools ""` is part of the command. The server itself is read-only, confines itself to `docs/` (including symlink checks) and caps file size at 1 MB, and `/sumarize` is limited to the Read and Write tools.
