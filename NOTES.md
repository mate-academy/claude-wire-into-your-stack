# Notes

**Server** — I connected the `filesystem` MCP server (`.mcp.json`), pointed at the project's `SecretsTheyDontWantYouToKnow` folder, so Claude can browse and read files there without them being pasted into the conversation. The permission rule in `.claude/settings.json` allows only the read-only `mcp__filesystem__*` tools and denies the mutating ones plus `Glob`/`Edit(.)`/`Write(.)`.

**Skill** — `commit-messages` (`.claude/skills/commit-messages/SKILL.md`) captures the repeated way I write commits here: single-line, `<type>: <description>`, imperative mood, no trailer. Its description says to fire "whenever writing a commit message in any project, unless the project's own CLAUDE.md or CONTRIBUTING guide specifies a different convention" — specific enough that it triggers on any commit-writing request without being named. A second skill, `pr-description` (`.claude/skills/pr-description/SKILL.md`), does the same for PR write-ups: what changed, why, and how to test.

**Command** — `/check-dod` (`.claude/commands/check-dod.md`) re-reads the DoD checklist fresh from README.md each time, checks each item's durable evidence against the actual repo, and updates only that section's checkboxes. It's worth a shortcut because it's the exact compliance check this project needs run repeatedly, and it doesn't hardcode the checklist items, so it stays correct even if the wording in README.md changes.

**Hook** — two hooks in `.claude/settings.json`, both project-scoped. A `PostToolUse` hook on `Edit|MultiEdit|Write` reacts after any edit by running `npm run lint`; since PostToolUse can't block a tool call that already ran, a failure is surfaced back to Claude via `hookSpecificOutput.additionalContext` instead. A `PreToolUse` hook on `Bash`, filtered to `git add` commands, prevents staging by running `.claude/hooks/pretest-git-add.js`, which maps the files being added to their related test file and denies the `git add` (via `hookSpecificOutput.permissionDecision`) if those tests fail.

**Headless run** — I ran `/check-dod` headless: `claude -p "/check-dod" --allowedTools "Read,Glob,Grep,Edit(README.md),Bash(git status *),Bash(git log *)"`. That locks it down to exactly the command's own `allowed-tools` frontmatter — read-only file and git inspection, plus edit rights scoped to `README.md` only — so nothing else was reachable and it was safe to let it update the checklist unattended.
Also ran claude -p "check the checkpoint for the hook task in DOD of the README.md file in the project" --allowedTools "Write" from the Theory of
the course to confirm it did not delete the README.
Also ran claude -p "commit and push the change to the README" - but it failed also due to restrictions.
