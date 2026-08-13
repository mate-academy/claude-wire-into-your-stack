# Notes

## MCP server: GitHub

Added the GitHub MCP server (`https://api.githubcopilot.com/mcp/`) at **project scope**, so it's committed in `.mcp.json` and shared with anyone who clones this repo.

### Why GitHub

This repo already lives on GitHub and has a CI workflow (`.github/workflows/ci.yml`) that runs lint and tests on every push and pull request. A GitHub MCP server lets Claude read and act on that context directly — inspect PR status, check CI run results, read/create issues, and comment on PRs — without pasting URLs or `gh` CLI output back into the conversation.

Other options were considered and set aside for now:
- **Postman/OpenAPI-style MCP** — would help keep `docs/api.md` in sync with the live API by hitting the running dev server, but isn't needed until the docs start drifting from behavior.
- **Database MCP (Postgres/SQLite)** — not applicable yet since `db/store.js` is a plain in-memory store; worth revisiting if the project migrates to a real database.

### Scope choice

Project scope (`--scope project`, stored in `.mcp.json`) rather than local or user scope, since this server is useful to anyone working on this repo, not just this machine/user.
