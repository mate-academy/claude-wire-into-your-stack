# Notes

## MCP server

I connected two project-scoped servers in `.mcp.json`: `context7` and `memory`. Context7 is the most useful here because this is an Express API, and it lets Claude pull current Express and ESLint docs instead of relying on training data that may be out of date. The `memory` server keeps a knowledge graph in `.claude/memory.json` so context can persist between sessions. The permission rule in `.claude/settings.json` allows `mcp__context7` and `mcp__memory`, which approves every tool on those two servers without a prompt each time. It doesn't allow any other server.

## Skill

The `commit-style` skill captures the habit of writing commits the same way every time: an imperative subject of at most 60 characters, a body that explains what changed and why (wrapped at 72), and a `Refs #123` line when there's an issue. Its description is "Use when writing git commit messages or PR descriptions." I worded it as a trigger condition rather than a summary, naming the two tasks it applies to, so Claude loads it whenever it is about to write a commit or PR text.

## Command

I added `/changes`, which takes an optional base branch or commit. It gathers the branch, status, recent commits and a diff stat, then produces a short summary: a one-sentence overview, changes grouped by area, and anything risky. It's worth a shortcut because I'd otherwise type the same git commands and the same request over and over, and `allowed-tools` limits it to read-only git commands so it runs without prompts.

## Hook

I set a `PostToolUse` hook that matches `Edit|Write|MultiEdit|NotebookEdit` and runs Prettier on the edited file. It reacts rather than prevents: it runs after the edit has already happened and cleans up the formatting, and it never blocks anything (the command ends in `|| true`). A `.prettierrc` with `singleQuote` keeps its output consistent with the existing code style.


## Headless

The headless command was: claude -p "Summarize what this project does in 3 bullets" --allowedTools "Read"
It was permitted to use commands to read the files, and prohibited from updating anything.