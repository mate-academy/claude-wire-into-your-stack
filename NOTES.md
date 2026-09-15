MCP Server

I added @modelcontextprotocol/server-filesystem at project scope in docs so that it can read and write documents covering all the 


Skill

I added a PR description skill that states the what, why and how to test of all changes. When I completed the work it called the PR description skill itself and wrote the PRs description


Command
checklist-review
Reviews against the checklist in claude.md and gives a list of fixes

Hook
Event: PostToolUse. The standard is "every JS file Claude touches passes ESLint", and that can only be checked after the file exists.
Matcher: Edit|Write, the tools that change files.
Command: node "$CLAUDE_PROJECT_DIR/.claude/hooks/lint-on-edit.js". Node keeps it cross-platform.


Headless
I ran claude -p "Add a test for the /users endpoint" --allowedTools "Read,Edit,Write,Bash(npm test)"
This added a test for the `400` validation path on `POST /users` (missing `name`/`email`) in `tests/users.test.js` — that was the one gap versus the CLAUDE.md convention of returning 400 on bad input. All 6 tests pass.
