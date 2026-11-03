# NOTES

## Server
I connected the official filesystem MCP server as "docs", at project scope, so it lives in the committed .mcp.json and pointed at the docs/ folder. It needs no credentials and lets Claude read the API reference (docs/api.md) while working on routes. In .claude/settings.json I only allowed its two read-only tools, mcp__docs__read_text_file and mcp__docs__list_directory, instead of the whole server. I used it once to read docs/api.md and summarize the API. Note: the launch command uses "cmd /c npx" because I work on Windows; on macOS or Linux the "cmd /c" part can be dropped.

## Skill
The add-route skill (.claude/skills/add-route/) captures how this project adds an endpoint: router in routes/, data access through db/store.js, wiring in server.js, { error } responses with 400 and 404, a test in tests/, and a line in docs/api.md. The description names the task in the words I'd actually use ("add, create or build a new endpoint, route or resource") plus examples like /orders. In a fresh session, a plan-only request didn't load it (Claude said it would use the skill once the work started); asking for a real GET /orders endpoint without naming the skill showed "Skill(add-route) – Successfully loaded skill". I then reverted that test code so only configuration is in this PR.

## Command
/review <file path> (.claude/commands/review.md) reviews one file against the project conventions and changes nothing. It uses $ARGUMENTS because the input is a single path. The first version asked for double quotes, which this project doesn't use, so it flagged ten false problems on routes/users.js. I changed it to follow the quote style in eslint.config.js and the rerun reported no problems. It's worth a shortcut because I'd run this check before every PR.

## Hook
A PreToolUse hook on Bash, at project scope in .claude/settings.json, runs .claude/hooks/block-push-main.js (Node, so it works on any OS). It prevents rather than reacts: if a command pushes to main it exits 2 and blocks it, otherwise it exits 0. I tested it by asking Claude to run "git push origin main"; it was denied before running, with the message to push a feature branch and open a PR instead.

## Headless run
I ran: claude -p "Summarize what this project does in 3 bullets" --allowedTools "Read,Glob,Grep" --max-turns 5. It could only read and search files, with no write, delete or shell access, and at most 5 turns, so it was safe to run with nobody watching. It printed three bullets and exited.
