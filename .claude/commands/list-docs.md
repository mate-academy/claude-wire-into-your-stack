---
description: List a subdirectory of the project's kapa-website-docs MCP filesystem server
argument-hint: [subdirectory]
---

List the contents of the directory `$1` using the `mcp__kapa-website-docs__list_directory` tool (the MCP filesystem server rooted at `C:\DATA\Dropbox\KAPA_Website`, configured in this project's `.mcp.json`).

- Pass `$1` as the `path` argument. If `$1` is empty, list the server's root directory instead.
- Report the results as a simple file/folder listing — don't summarize or interpret the contents unless asked.
