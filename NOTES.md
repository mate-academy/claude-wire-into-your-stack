# NOTES.md

## Server
Connected the `fetch` MCP server at project scope (`.mcp.json`), credential-free. Useful for pulling in external API references while working on this repo. Permission rule scopes it to read-only fetch access, not blanket-allowed to the whole server.

## Skill
Added a `precommit` skill (`.claude/skills/precommit/SKILL.md`) that runs lint and tests and reports a go/no-go before committing. Description fires on phrases like "about to commit," "check before commit," or "is this ready to commit," specific enough to avoid triggering on unrelated requests. Confirmed it triggers on request without the skill being named directly.

## Command
Added `/summary <target> <sentence-count>` (`.claude/commands/summary.md`), using `$1` for the target (file, dir, commit, branch, or PR) and `$2` for exact sentence count. Worth a shortcut because summarizing changes is a repeated need during review, and the fixed sentence-count constraint keeps output consistent instead of rewriting the same prompt each time. Confirmed it runs and produces an accurate summary.

## Hook
Set a `PostToolUse` hook on matcher `Write|Edit` in `.claude/settings.json`, runs `eslint --fix` after any file edit. Reacts (doesn't prevent), enforces linting consistency automatically instead of relying on remembering to run it manually. Confirmed it fires on a Claude-made edit; this project's ESLint config only has a `no-unused-vars` rule with no spacing/style rules, so a messy-spacing test correctly produced zero changes, the hook runs and checks every edit regardless of whether a given edit happens to violate anything.

## Headless
Ran `claude -p "summarize what the routes folder does" --allowedTools "Read" "Grep"`. Locked down to read-only tools since the task only needed to inspect and describe existing code, no write or execute access needed.