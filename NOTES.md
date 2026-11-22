# Notes: Project-Level Claude Configuration

## MCP Server Connection
I connected the Model Context Protocol filesystem server to `/Users/Vladyslav_/projects` so the entire team can browse the project structure, read files, and search across the codebase. It's useful here because the Express API course project has multiple interdependent files (server.js, routes/, db/, tests/) that new team members need to explore without needing direct shell access. The permission rule allowed read-only operations: `mcp__filesystem__read_directory`, `read_text_file`, `get_file_info`, `list_directory`, `list_directory_with_sizes`, and `search_files` — enabling safe exploration while preventing accidental modifications.

## update-config Skill
The update-config skill captured the repeated way of configuring Claude Code's `settings.json` for automated behaviors, permission management, and environment variables. I worded the description to focus on practical outcomes ("Configure hooks that run from now on when...", "Allow/deny/move permissions", "Set env vars project-wide") rather than technical JSON details, so it fires whenever the user asks about Claude prompting, harness behavior, or sharing project-wide settings across the team.

## api-start Command
I added the `api-lint` command 

## PreToolUse Hook
I set a `PreToolUse` hook that **prevents** `git push --force` commands, reacting on the `Bash(git push --force:*)` event. This is a standard team safety guard that fires before any bash tool runs, blocking force pushes that could overwrite colleagues' work. The hook provides immediate feedback without requiring the user to remember a permission rule — it just blocks the command and explains why.

## What Was Run Headless and Locked Down
I ran the MCP filesystem server headless (stdio transport via npx) to provide read-only file browsing without exposing write capabilities. I locked down permissions by denying `mcp__filesystem__create_directory`, `write_file`, `edit_file`, `move_file`, and `rename_file`, while also blocking `Bash(git push --force:*)` at the project level. The headless server runs in the background, and the permission rules persist across Claude Code sessions for the whole team.