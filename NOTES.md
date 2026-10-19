# Notes

## What I set up

I wired Claude into this project with four project-level integrations:

1. **MCP server**
   - Added a project-scoped MCP server in `.mcp.json`.
   - Used the filesystem server for the project docs folder so Claude can safely read project documentation.

2. **Permissions**
   - Added `permissions.allow` in `.claude/settings.json`.
   - Kept the allowed tools limited to the MCP read/list actions needed for this repo.

3. **Skill**
   - Created a project skill in `.claude/skills/add-api-route/SKILL.md`.
   - The skill captures the project’s repeatable route-scaffolding pattern so Claude can apply it consistently.

4. **Command**
   - Added a custom command in `.claude/commands/review-checklist.md`.
   - This gives a reusable shortcut for code review checks.

5. **Hook**
   - Configured a `PostToolUse` hook in `.claude/settings.json`.
   - The hook runs `npm run lint` after file edits to enforce the project standard automatically.

## Validation I did

- Confirmed `package.json` contains a `lint` script.
- Tested the hook workflow with a small edit.
- Ran a headless Claude task with `claude -p` after trusting the workspace.
- Verified the headless run could read files and return a result successfully.

## Why these choices

- I used a filesystem MCP server because it is useful for this repo and safe to scope to project docs.
- I kept permissions narrow so Claude only has the access it needs.
- I made the hook run `npm run lint` because linting is already defined in `package.json` and is the right automatic check for this project.
- I used a skill and a command to capture repeatable project behavior in a way Claude can reuse consistently.

## Result

The repo now includes:
- a project-scoped MCP server,
- project permissions,
- one project skill,
- one custom command,
- and one automated hook.

This makes the Claude setup repeatable for anyone working on the repository.