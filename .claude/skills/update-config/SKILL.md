---
name: update-config
description: Configure the Claude Code harness by editing settings.json files. Use whenever the user wants automated behavior ("from now on when X", "each time Claude does Y, run Z", "before/after a tool runs"), which means hooks; wants to allow, deny, or ask about permissions; wants to set environment variables for Claude Code sessions; or wants to move a setting between user, project, and local scope. Also use for questions like "why is Claude asking permission for this" or "how do I stop it prompting for X", even when the user never mentions settings.json. Do NOT use for adding or sharing MCP servers (that is `claude mcp add` and `.mcp.json`) or for editing CLAUDE.md.
---

# Update Claude Code configuration

Claude Code reads behavior from `settings.json` files. This skill covers hooks, permissions, and environment variables. Read the existing file before editing, because it often holds settings the user wants to keep.

## Step 1: Pick the right file

Ask which scope the user wants if it is not obvious.

| Scope | File | Shared with team? |
|---|---|---|
| User (all projects) | `~/.claude/settings.json` | No |
| Project | `.claude/settings.json` | Yes, commit it |
| Local (this project, this machine) | `.claude/settings.local.json` | No, gitignored |

Default to project scope for anything the team should share and local scope for personal tweaks. More specific scopes override broader ones, and `deny` rules win over `allow` rules at any scope.

To move a setting between scopes, read it from the source file, write it to the target file, then remove it from the source so the two don't drift apart.

## Step 2: Make the edit

If the file does not exist, create it with `{}`. Merge new keys into existing objects and arrays instead of overwriting them, and keep the JSON valid, since a syntax error disables the whole file.

### Hooks: automated behavior

Hooks run a shell command when a lifecycle event fires. Use them for "every time X happens, do Y", because the harness runs them deterministically instead of relying on Claude to remember.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "npx prettier --write \"$CLAUDE_FILE_PATHS\"" }
        ]
      }
    ]
  }
}
```

| User says | Event | Matcher |
|---|---|---|
| "before Claude runs a command" | `PreToolUse` | tool name, e.g. `Bash` |
| "after Claude edits a file" | `PostToolUse` | e.g. `Edit\|Write` |
| "when Claude finishes responding" | `Stop` | none |
| "when I submit a prompt" | `UserPromptSubmit` | none |
| "when a session starts" | `SessionStart` | none |

A `PreToolUse` hook that exits with a blocking status stops the tool call. Keep hook commands fast and test them in a terminal first. Event names and payload fields change between versions, so check the current hooks documentation if unsure.

### Permissions: allow, deny, ask

```json
{
  "permissions": {
    "allow": ["Bash(npm run test:*)", "Read(src/**)"],
    "ask": ["Bash(git push:*)"],
    "deny": ["Read(.env)", "Bash(rm -rf:*)"]
  }
}
```

- `allow` runs without prompting, `ask` always prompts, `deny` is blocked outright.
- Rule format is `Tool` or `Tool(specifier)`. Bash specifiers use a prefix match with `:*`.
- MCP tools are named `mcp__<server>__<tool>`. Use `mcp__<server>` alone to cover every tool on that server.
- Allow the narrowest rule that solves the problem. A broad `Bash` allow removes a safety check, so mention the tradeoff if the user asks for one.

### Environment variables

```json
{
  "env": {
    "DEBUG": "true",
    "PORT": "3000"
  }
}
```

These apply to commands Claude runs, not to the user's own shell. Keep secrets out of committed project files; use the local file or the shell environment.

## Step 3: Confirm

Show the final block that changed and name the file it went into. Tell the user to run `/hooks` or `/permissions` in Claude Code to confirm it loaded, and that some changes only apply to new sessions.

## What does not belong in settings.json

- **MCP servers:** define them with `claude mcp add --scope project ...`, which writes `.mcp.json`. `settings.json` only controls approval of those servers (for example `enabledMcpjsonServers`). Use this skill afterward to set permissions for a server's tools.
- **Project instructions** (build commands, code style): put these in `CLAUDE.md`.
- **Machine-specific absolute paths** in shared files: they break for teammates. Prefer relative paths or `${VAR}` expansion.