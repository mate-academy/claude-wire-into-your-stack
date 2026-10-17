# Notes

## MCP server (`.mcp.json`)

- **Version pinned.** The `docs` server runs `@modelcontextprotocol/server-filesystem@1.0.0` (the npm `latest` version on 2026-10-17), so a new release can't change its behaviour without anyone noticing.
- **The `cmd /c` wrapper is only for Windows.** `npx` on Windows has to be started through `cmd /c`. Reviewers on macOS or Linux should set `"command": "npx"` and remove `"/c"` and `"npx"` from the start of `args`:

  ```json
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem@1.0.0", "./docs"]
  ```

- **The relative `./docs` path is intentional.** Claude Code always starts project MCP servers from the project root, so `./docs` always points to this repo's `docs/` folder.

## Permissions (`.claude/settings.json`)

- **The narrow allowlist is intentional.** Only `mcp__docs__read_text_file` and `mcp__docs__list_directory` are pre-approved, as the exercise asked. Every other `docs` tool, including all the write tools, still asks for permission.
