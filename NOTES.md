# Claude Wiring Notes

- **MCP server:** Connected the credential-free filesystem server at project scope, pointed at `docs/`. The permission rule allows only directory listing and file reading, keeping the server read-only for normal project use.
- **Skill:** Added `route-pattern` to capture the project's Express route conventions. Its description specifically triggers when creating or modifying routes in `routes/`.
- **Command:** Added `/review` as a reusable shortcut for reviewing the current diff, tests, validation, error handling, and unintended files.
- **Hook:** Added a project-level `PostToolUse` hook for `Write|Edit` that runs `npm test` after changes, so the test suite is automatically checked.
- **Headless task:** A scoped headless run should be limited to the tools needed for inspection/testing, such as `Bash(git diff *)`, `Bash(npm test)`, and read-only file access. Claude Code was not available in this environment, so this wiring was prepared without executing the Claude CLI.
- **Model:** Used GPT-5.6 Luna to prepare the project wiring and configuration.
