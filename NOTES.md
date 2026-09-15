MCP Server

I added @modelcontextprotocol/server-filesystem at project scope, scoped to the docs/ folder, so Claude can look up API reference docs while working on routes without me having to paste them in. My permission rule denies write_file, edit_file, create_directory, and move_file, so it's allowed read-only tools only (read_file, list_directory, search_files, get_file_info, directory_tree) — it can look things up but never modify docs on its own.


Skill

I added a PR description skill that captures how this project writes PR descriptions: a fixed What Changed / Why / How to Test structure. I worded the description ("Writes a pull request description... Use when asked to write or draft a PR description, or when a PR is being created/updated and doesn't already have a description.") so it fires on both an explicit request and the implicit "PR needs a description" moment, without me having to name it. When I finished the work it triggered on its own and wrote the PR description.


Command
checklist-review
Reviews the codebase (or a given diff/PR/scope) against the conventions in CLAUDE.md and lists fixes for anything that doesn't match. It's worth a shortcut because it's a review I'd otherwise redo by hand before every PR — one command re-checks all four conventions and gives file/line-level fixes instead of me re-reading CLAUDE.md each time.

Hook
Event: PostToolUse — it reacts after a file is written, rather than trying to prevent the edit itself. The standard is "every JS file Claude touches passes ESLint", and that can only be checked after the file exists.
Matcher: Edit|Write, the tools that change files.
Command: pulls the touched file path from the tool input/response with jq, then runs ./node_modules/.bin/eslint on it if it's a .js file.


Headless
I ran claude -p "Add a test for the /users endpoint" --allowedTools "Read,Edit,Write,Bash(npm test)"
This added a test for the `400` validation path on `POST /users` (missing `name`/`email`) in `tests/users.test.js` — that was the one gap versus the CLAUDE.md convention of returning 400 on bad input. All 6 tests pass.
