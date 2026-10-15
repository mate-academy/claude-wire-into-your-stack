# Folder Summary

- `.claude/` — local Claude Code settings for this project (`settings.local.json`).
- `.env` — local environment variables (not committed).
- `.github/workflows/ci.yml` — GitHub Actions CI workflow.
- `.gitignore` — files/directories excluded from git.
- `.mcp.json` — MCP server config (GitHub server via Docker).
- `CLAUDE.md` — project instructions and conventions for Claude Code.
- `README.md` — project overview and usage docs.
- `db/store.js` — in-memory data store used by all routes.
- `docs/api.md` — API documentation.
- `eslint.config.js` — ESLint configuration.
- `package.json` — npm package manifest (scripts, dependencies).
- `package-lock.json` — locked dependency versions.
- `routes/health.js` — health-check endpoint router.
- `routes/users.js` — users resource endpoint router.
- `server.js` — Express app entry point; mounts routers and starts the server.
- `tests/users.test.js` — tests for the users route.
