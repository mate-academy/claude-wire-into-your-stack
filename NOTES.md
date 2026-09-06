# Claude Code Setup Notes

Summary of the Claude Code customizations added to this repo.

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

## Pending: Daily Commit-Scan Task (not yet finished)

A local, unattended `claude -p` job that scans commits on `feature/WireClaudeIntoYourStack`
since its last run, inserts `TODO:` comments on issues it finds, and appends a report. The
pieces are built and committed, but **the Windows scheduled task itself has not been
registered yet** — it currently does not run on any schedule.

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

### To finish: register the Windows scheduled task

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

Allowed tools:
- Bash - Need to execute basch commands
- Read,Write,Edit - Need to review and provide feedback and create report
- Glob - Need to evaluation
- Grep - Need to search code block

