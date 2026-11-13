# Notes

## Server and permission rule

I connected a small local MCP server, `docs-readonly` (`mcp-docs-server/server.js`, registered in `.mcp.json`). It exposes two tools, `list_docs` and `read_doc`, over the `docs/` folder. It is useful here because the API reference lives in `docs/api.md`, and Claude can now read it on demand without me pasting it in or giving it broad filesystem access. The permission rule `mcp__docs-readonly` in `.claude/settings.json` allows only that server's tools without prompting. Both tools are read-only and the server rejects any path outside `docs/`, so everything else still asks first.

## Skill

The skill `what-why-how` captures a repeated way of explaining things: whenever I ask about a topic, the answer should be a short What, then Why, then How. Its description says what it does and names the situations that should trigger it ("asks about, wants explained, or wants a summary of a topic, concept, tool, or technology") and gives example phrasings like "tell me about X" and "explain X". That wording is what lets Claude match it to everyday questions without me typing a command.

## Command

I added `/sumarize <source-file> <destination-file>` (`.claude/commands/sumarize.md`). It reads one file and writes a Markdown summary to another, never touching the source and asking before overwriting. It is worth a shortcut because it is a task I repeat with the same shape and two inputs, and the command fixes the steps, the arguments and the safety rules (only Read and Write allowed) so I don't re-explain them each time.

## Hook

I set a `PostToolUse` hook with the matcher `Edit|Write` that runs Prettier on the file Claude just changed (`.claude/hooks/format.js`). It reacts rather than prevents: it runs after the edit has happened, cleans up formatting, and never blocks anything. It makes formatting automatic instead of something I have to remember to ask for.

## Headless and lock-down

I ran Claude Code headless with `claude -p "List the files in the docs server and summarize api.md" --allowedTools "mcp__docs-readonly"`. It listed the one file in `docs/` (`api.md`) and returned an accurate summary (base URL, the health endpoint, and the four users endpoints, noting there is no DELETE), with no prompts. That confirms the server connects and its tools work end to end. Earlier, `claude mcp list` is how I found and fixed an invalid `.mcp.json`.

What I locked down: `--allowedTools` limited the run to that one server's tools, so a headless run could not edit files or run shell commands. The server itself is read-only, confines itself to `docs/` (including symlink checks) and caps file size at 1 MB. The standing permission rule in `.claude/settings.json` is scoped to the same server, and `/sumarize` is limited to the Read and Write tools.
