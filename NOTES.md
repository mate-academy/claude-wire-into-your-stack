# NOTES.md

**Server:** I connected the `filesystem` MCP server, pointed at the project root. It gives Claude a clean way to browse and read the repo's files. The permission rule only enables it for this project (`.mcp.json` + `enabledMcpjsonServers`), and since it's a local, credential-free server there's nothing to keep secret.

**Skill:** `pr-description` captures the format we always want for PR write-ups — What changed, Why, How to test, in that order — so nobody has to retype the template every time. I worded the description around "write/draft a PR description" specifically, so it fires for that ask and doesn't get triggered by a general "summarize this" request.

**Command:** `/find-todos` scans the codebase for `TODO`/`FIXME` comments and lists them by file. It's the kind of check you run the same way every time (before a release, before a PR), so it's worth having as a one-word shortcut instead of re-explaining it each time.

**Hook:** A `PostToolUse` hook on `Write|Edit` — it reacts after an edit rather than blocking one. It runs `eslint --fix` on whatever `.js` file was just touched, so linting happens automatically instead of depending on someone remembering to run it.

**Headless run:** I ran `/find-todos` headless with `claude -p "/find-todos" --allowedTools "Grep"`. I only allowed `Grep` — no `Bash`, `Write`, or `Edit` — since the task is just a read-only search and doesn't need anything more with nobody watching it.
