# Notes

## MCP server and permission rule
Two servers are declared at project scope in the committed `.mcp.json`, so anyone who clones the repo gets them:

- **`fetch`** (`uvx mcp-server-fetch`, stdio) lets Claude pull a web page as markdown. I chose it because this is an Express API, and Claude can read the current Express and Node docs instead of guessing at an API from memory. It needs no credentials, so there is no secret to keep out of the file. It requires `uv` to be installed.
- **`claude-code-docs`** (`https://code.claude.com/docs/mcp`, HTTP) lets Claude look up Claude Code behavior in the official docs while configuring settings, hooks and skills.

`.claude/settings.json` scopes what they may do with `permissions.allow`:

```json
"permissions": {
  "allow": [
    "mcp__fetch__fetch",
    "mcp__claude-code-docs__search_claude_code_docs"
  ]
}
```

Only the two read-only tools I actually use are allowed without a prompt. Neither server is blanket-allowed (no `mcp__fetch` or `mcp__fetch__*`), so any other tool the servers expose still asks first.

## Skill: `code-simplifier`
Captures a repeated workflow: find the recent diff, run tests and lint for a baseline, simplify without changing behavior, re-verify, then report. It also applies the project conventions from CLAUDE.md. The description fires on the user's own words: "Simplify recently changed code without changing its behavior. Use when the user asks to: simplify, clean up, tidy, or refactor recent changes, a diff, or the last commit." It states what the skill does and lists the trigger phrases and the things they apply to.

## Command: `/commit`
Gathers the branch, status, diff, and recent commits up front with `!` shell injection. It creates a branch if on `main`, runs `npm test` and `npm run lint` and stops on failure, stages files by name, matches the recent commit style, and never pushes or uses `--no-verify`. It's worth a shortcut because commits happen constantly, and this makes every one run the same checks and follow the same safety rules. `allowed-tools` limits it to the git and npm commands it needs.

## Hook: format on edit
A `PostToolUse` hook on `Edit|Write` that runs `.claude/hooks/format.js`. It reacts and doesn't prevent anything, since it fires after the edit. It runs Prettier, then `eslint --fix`, on the edited JS file. If lint errors remain that `--fix` can't resolve, it exits with code 2 and sends them back to Claude to fix.

### Headless Command
The headless command was "claude -p "Explain what this code does --allowedTools  "Read,Grep,Glob" and was useful as it had a summary of the purpose of the code.
