# Note.md

Which server did you connect, why is it useful here, and what did your permission rule allow?
- Connected to GitHub MCP server (via .mcp.json).
- Useful for interacting with GitHub (e.g., getting user info, managing repositories, etc.) as part of the workflow.
- Permission rule allows `mcp__github__get_me` (to get the current GitHub user) and denies `mcp__github__create_branch` (to prevent creating branches).

What repeated way of working did your skill capture, and how did you word the description so it fires?
- The api-doc-generator skill captures the repeated way of working of generating API documentation for an Express.js codebase.
- The description is worded as "Generate create update API documentation" (in the skill's frontmatter) and it fires when the user asks to generate API documentation for their Express.js project.

What command did you add, and what makes it worth a shortcut?
- Added a command named `test` (in .claude/commands/test.md) that runs `npm test` and shows raw output without analysis.
- Worth a shortcut because it allows quickly running tests and seeing simple pass/fail results without extra commentary or suggested fixes.

What hook did you set — does it react or prevent, and on which event?
- Set two hooks in .claude/settings.json:
  1. PreToolUse hook on Bash: preventive; runs `npm test` before `git push` and blocks the push if any test fails.
  2. PostToolUse hook on Edit: reactive; runs `npx prettier --write %f` after a file edit to format the code.
- The first hook prevents the command from running on failure; the second reacts after the edit.

What did you run headless, and what did you lock down?
- Ran the GitHub MCP server headless (via stdio mode).
- Locked down the ability to create branches via GitHub (by denying `mcp__github__create_branch` in permissions).