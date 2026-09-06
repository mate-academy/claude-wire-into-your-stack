# Claude Code Setup Notes

Summary of the Claude Code customizations added to this repo.
## MCP Server
- Added GITHUB MCP server to .mpc.json allowing GITHUB access to the forked repo. This does require an access token for security purposes.
### Execution
- Claude used the server to access GitHub to manage this repo
  - Create a new branch
  - Push Commits to GitHub
  - Create a pull request.
### Permisions
- The Allow permission are specified in the repo/project settings.json
-- "allow": [
      "mcp__github__create_branch",            - Create branches for code, never allow changes to main
      "mcp__github__create_or_update_file",    - Ability to manage codebase
      "mcp__github__get_commit",               - Ability to commit changes
      "mcp__github__get_file_contents",        - Ability to retrieve / read files in repo
      "mcp__github__list_branches",            - Ability to retreve branch list
      "mcp__github__list_commits",             - Ability to list/read commits
      "mcp__github__list_pull_requests",       - Ability to list current pull requests
      "mcp__github__pull_request_read",        - Read pull request
      "mcp__github__push_files"                - Puah files to GITHUB
    ],
    "deny": [
      "mcp__github__add_comment_to_pending_review",
      "mcp__github__add_issue_comment",
      "mcp__github__add_reply_to_pull_request_comment",
      "mcp__github__create_pull_request",
      "mcp__github__create_repository",
      "mcp__github__delete_file",
      "mcp__github__delete_repository",
      "mcp__github__fork_repository",
      "mcp__github__get_label",
      "mcp__github__get_latest_release",
      "mcp__github__get_me",
      "mcp__github__get_release_by_tag",
      "mcp__github__get_tag",
      "mcp__github__get_team_members",
      "mcp__github__get_teams",
      "mcp__github__issue_read",
      "mcp__github__issue_write",
      "mcp__github__list_issue_fields",
      "mcp__github__list_issue_types",
      "mcp__github__list_issues",
      "mcp__github__list_releases",
      "mcp__github__list_repository_collaborators",
      "mcp__github__list_tags",
      "mcp__github__merge_pull_request",
      "mcp__github__pull_request_review_write",
      "mcp__github__request_copilot_review",
      "mcp__github__run_secret_scanning",
      "mcp__github__search_code",
      "mcp__github__search_commits",
      "mcp__github__search_issues",
      "mcp__github__search_pull_requests",
      "mcp__github__search_repositories",
      "mcp__github__search_users",
      "mcp__github__sub_issue_write",
      "mcp__github__update_pull_request",
      "mcp__github__update_pull_request_branch"
    ]


## Commands

- **`/format`** (`.claude/commands/format.md`) — Reformats all project files with Prettier
  (`npx prettier --write .`) and reports which files changed. Prettier config lives in
  `.prettierrc.json` (single quotes, semicolons, trailing commas, 100-char width);
  `.prettierignore` excludes `node_modules` and `package-lock.json`.

## Skills

- **`list-todos`** (`.claude/skills/list-todos/SKILL.md`) — Scans the tracked source for
  `TODO`, `FIXME`, `HACK`, and `XXX` markers and reports them grouped by file with line
  numbers. Read-only; makes no changes.

## Hooks

- **Main-branch edit protection** (`.claude/settings.json`, `PreToolUse` hook) — Blocks
  `Write`, `Edit`, and `NotebookEdit` tool calls whenever the current git branch is `main`,
  denying the call with an explanatory message. Has no effect on any other branch.

## Daily Commit-Scan Task

A local, unattended `claude -p` job that scans commits on `feature/WireClaudeIntoYourStack`
since its last run, inserts `TODO:` comments on issues it finds, and appends a report. 

Files already in place:

- `scripts/daily-scan.ps1` — wrapper script: reads `.claude/scan-prompt.txt`, runs
  `claude -p` against it with `.claude/scan-task.settings.json` as an extra `--settings`
  overlay and `--allowedTools "Bash,Read,Write,Edit,Glob,Grep"`, and logs output to
  `.claude/logs/` (gitignored).
- `.claude/scan-prompt.txt` — the scan instructions given to `claude -p`: check out and
  pull `feature/WireClaudeIntoYourStack`, diff against the SHA in
  `.claude/last-scan-commit.txt` (or the repo root commit on first run), review changed
  files, insert `TODO:` comments at issues found, append a dated section to
  `SCAN_REPORT.md`, update `.claude/last-scan-commit.txt`, then commit and push — all
  without opening a PR or touching any other branch.
- `.claude/scan-task.settings.json` — scoped `permissions.allow` overlay
  (`Bash(git *)`, `Read`, `Glob`, `Grep`, `Edit`, `Write`) so the unattended run doesn't
  hit permission prompts, without a blanket `--dangerously-skip-permissions`.

### The Windows scheduled task

Run (from an elevated or normal PowerShell prompt — no admin rights needed for a
per-user task):

```powershell
schtasks /create /tn "ClaudeWireIntoYourStack-DailyScan" /sc daily /st 02:07 /tr "powershell.exe -NoProfile -ExecutionPolicy Bypass -File \"c:\Jobs\Training\rphoffman\claude-wire-into-your-stack\scripts\daily-scan.ps1\""
```

Arguments:
- `/tn "ClaudeWireIntoYourStack-DailyScan"` — task name.
- `/sc daily /st 02:07` — daily at 2:07 AM local time.
- `/tr "..."` — runs `daily-scan.ps1` via PowerShell with script signing/profile
  restrictions bypassed just for this invocation.

By default this creates a task that only runs while the user is logged on (no stored
password required). Use `schtasks /query /tn "ClaudeWireIntoYourStack-DailyScan"` to
confirm it registered, and `schtasks /run /tn "ClaudeWireIntoYourStack-DailyScan"` to
trigger a manual test run (note: a real run will commit and push to
`feature/WireClaudeIntoYourStack` if it finds new commits to scan).


Allowed tools:
- Bash - Need to execute basch commands
- Read,Write,Edit - Need to review and provide feedback and create report
- Glob - Need to evaluation
- Grep - Need to search code block
### I ran the following for this assignment
claude -p "List all TODO comments in this project" --allowedTools "Bash,Grep,Read"
This ran and did not find any TODO comments in the project. I also added a TODO comment in a file and ran the same commend and it found the TODO comment and reported it to me.
#### Headless Execution Results
claude -p ".claude/scan-prompt.txt" --settings ".claude/scan-task.settings.json" --allowedTools "Bash,Read,Write,Edit,Glob,Grep"
This ran with leveraging the allowed permissions in settings.json. It did not need to find any issues so it did not generate the report.

