# NOTES

## Server (MCP)
Connected the `filesystem` server (`@modelcontextprotocol/server-filesystem`) at project scope, committed in `.mcp.json`, pointed at `.` (the repo root). It's useful here because the course work is largely about reading and cross-checking files in this repo (docs, config, source) — having Claude reach the filesystem through a dedicated server rather than ad hoc shell commands.

My permission rule in `.claude/settings.json` allows only the read-only tools: `read_text_file`, `read_multiple_files`, `list_directory`, `list_directory_with_sizes`, `directory_tree`, `search_files`, `get_file_info`, `list_allowed_directories`. `write_file`, `edit_file`, `move_file`, and `create_directory` are not allowed — the server can look, not touch. Used it to list `docs/` and inspect file metadata (`list_directory` + `get_file_info`) to sort documents by last-modified date.

## Skill
The repeated way of working: whenever someone wants a rundown of the project's docs, freshest first. Captured as `.claude/skills/open_docs_folder/SKILL.md`.

Description: "Use the filesystem MCP server to list the project's docs folder, sorted by last-modified date, descending." Worded around the concrete action (list docs, sorted by date) rather than a vague topic, so it fires on phrasing like "what documents exist in this project, newest first" without naming the skill — confirmed this triggers correctly.

## Skill
Also added `.claude/skills/images/SKILL.md` — an `/images` skill that lists image files in `docs/` (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`), reading each one with the `Read` tool to write a short one-line description of what it shows. Mirrors `open_docs_folder`'s structure. Tested against `docs/claude-mcp-servers.jpg`, correctly described as a sequence diagram of Claude Desktop querying a CSV file through an MCP server. That image was previously untracked; it's now committed too, so the skill has something to find in a fresh clone.

## Command
Added `.claude/commands/imagelist.md` — a `/imagelist` command that runs the same "list `docs/` images with a one-line description" prompt on demand, rather than waiting for the skill to auto-fire. Worth a shortcut because it's a quick one-off check you'd run explicitly ("what images do we have?") without needing to phrase a request that happens to match the skill's trigger. Ran it once against `docs/claude-mcp-servers.jpg` and got the same correct description as the skill. Originally named `images`, renamed to `imagelist` to avoid colliding with the skill of the same name.

## Hook
`PostToolUse` on matcher `Edit|Write` in `.claude/settings.json`: runs `eslint --fix` on the edited file if it's a `.js` file outside `node_modules`. It reacts rather than prevents — it doesn't block the edit, it cleans up after it, so every JS edit stays lint-clean automatically for anyone who pulls the repo.

## CI
`.github/workflows/ci.yml` has never actually run — `gh api repos/.../actions/runs` shows `total_count: 0` despite the workflow being committed since June and several pushes to `main` since. Checked `actions/permissions` (enabled, `allowed_actions: all`) and the workflow list (`state: active`), both looked fine, so it wasn't an obvious config error. The real cause: `gh api repos/lehmoja/claude-wire-into-your-stack` shows `"fork": true`, parent `mate-academy/claude-wire-into-your-stack` — GitHub disables Actions by default on forked repos, and it was never turned on for this fork in Settings → Actions → General. Not something fixable from the repo's committed files; needs a manual toggle on GitHub.

## Headless run
PS C:\Users\Jari\claude-wire-into-your-stack>  schtasks /create /tn "ClaudeImageList" /tr 'powershell.exe -NoProfile -WindowStyle Hidden -File "C:\Users\Jari\claude-wire-into-your-stack\scripts\imagelist-task.ps1"' /sc daily /st 10:40
SUCCESS: The scheduled task "ClaudeImageList" has successfully been created.
