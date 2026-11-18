# Notes

## 1. MCP server
I connected the `docs` server (`@modelcontextprotocol/server-filesystem`, stdio, scoped to `./docs`) in `.mcp.json`. It's useful here because `docs/api.md` is the API reference that has to stay in step with the routes, and the server gives Claude a narrow, documented way to read it. The permission rule in `.claude/settings.json` allows only `mcp__docs__read_text_file` and `mcp__docs__list_directory`, so reading is pre-approved. The write, move and edit tools on that server still need approval.

## 2. Skill
`add-api-endpoint` captures the routine for adding or changing an endpoint: store helper first, then route, `400`/`404` JSON errors, tests, `docs/api.md`, and finally `npm test` and `npm run lint`. The description starts with "Use when adding or changing an HTTP endpoint or resource in this Express API" and gives example phrasings ("add a DELETE /users/:id route", "add a PATCH endpoint"). It also says what it is not for (unrelated bug fixes, lint config, CI), so it fires on the right requests and stays out of the way otherwise.

## 3. Command
`/review-conventions [scope]` reviews changes against the checklist in CLAUDE.md, runs tests and lint, and ends with "Ready to commit" or a list of fixes. It's worth a shortcut because I'd otherwise retype the same seven-point checklist before every commit. The optional `$ARGUMENTS` scope narrows it to a file or ref, and it defaults to the uncommitted changes. It's read-only.

## 4. Hook
A `PostToolUse` hook on `Edit|Write` runs `.claude/hooks/lint-fix.js`, which runs `eslint --fix` on the edited `.js` file. It reacts instead of preventing: the edit has already happened, anything ESLint can auto-fix is fixed silently, and any remaining error or warning (it runs with `--max-warnings=0`) goes back to Claude (exit 2) to fix in the same turn. The standard it holds is the project's existing ESLint config.

## 5. Headless
I ran a read-only review: summarise the uncommitted changes, then run the tests.

```
echo "Summarise the uncommitted changes in under 120 words, then run the test suite and report pass/fail counts. Do not modify any files." | \
  claude -p \
    --allowedTools "Read" "Bash(git diff:*)" "Bash(git status:*)" "Bash(npm test)" \
    --max-turns 8
```

I allowed only `Read`, `git diff`, `git status` and the exact `npm test`. I left out `Edit`, `Write` and unscoped `Bash`, and capped the run at 8 turns.

`--allowedTools` only pre-approves the listed tools; it is not a deny-list inverse. I passed no `--permission-mode`, so the run used the default mode, where a tool that isn't pre-approved needs approval. Headless there is nobody to give it, so the call is refused. I checked this with the same flags: a `Write` and a `touch` command (neither listed) were both denied and nothing was created. That's the restriction it provides, and it is not a general "everything unlisted is blocked" guarantee: default mode also lets read-only shell commands such as `date` run without being listed. If a hard block matters, add `--disallowedTools` for the tools you never want used. The prompt goes on stdin because `--allowedTools` takes a list and swallows a prompt placed after it.
