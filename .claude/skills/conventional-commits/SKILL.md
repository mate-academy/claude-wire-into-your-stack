---
name: conventional-commits
description: Format commit messages following Conventional Commits v1.0.0-beta.4 specification
---

# Conventional Commits Format

When creating or drafting commit messages in this repository, follow the [Conventional Commits v1.0.0-beta.4](https://www.conventionalcommits.org/en/v1.0.0-beta.4/) specification.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Type
Allowed types include:
- **`feat`** — a new feature (triggers minor version bump)
- **`fix`** — a bug fix (triggers patch version bump)
- **`docs`** — documentation only changes
- **`style`** — changes that don't affect code meaning (whitespace, formatting, missing semicolons, etc.)
- **`refactor`** — code changes that neither fix bugs nor add features
- **`perf`** — code changes that improve performance
- **`test`** — adding or updating tests
- **`chore`** — changes to build process, dependencies, tooling (e.g., updating scripts)
- **`ci`** — changes to CI/CD configuration and scripts
- **`build`** — changes to the build system or external dependencies

## Scope

Scope is optional but recommended to clarify which part of the codebase is affected. Here are suggested scopes for this repository (you can use one of these, propose a different one, or omit the scope entirely):

- **`store`** — `db/store.js` and mock data loading
- **`routes`** — `routes/` directory, or specific route: `users`, `health`
- **`users`** — `/users` endpoint specifically
- **`health`** — `/health` endpoint specifically
- **`mcp`** — MCP server and filesystem integration (`.mcp.json`, `scripts/start-filesystem-mcp.js`)
- **`scripts`** — helper scripts in `scripts/`
- **`tests`** — test files in `tests/`
- **`docs`** — documentation files (README.md, CLAUDE.md, etc.)
- **`ci`** — CI/CD configuration (.github/, etc.)
- **`claude`** — Claude Code configuration and skills (.claude/, .mcp.json)

### Scope Examples

- `feat(store): load users from mocks/users.mock.json`
- `fix(users): validate email format in POST endpoint`
- `test(health): add liveness check test`
- `chore(mcp): improve symlink sync error handling`

## Breaking Changes

Mark breaking changes by adding `!` after the type/scope (e.g., `feat!:` or `feat(api)!:`), or by including a `BREAKING CHANGE:` footer:

```
feat!: require mocks/users.mock.json for all operations
```

or

```
feat: change API response format

BREAKING CHANGE: POST /users now returns user ID in the response body instead of headers
```

## Description

- Use the imperative mood ("add" not "added" or "adds")
- Don't capitalize the first letter
- No trailing period
- Keep it concise (under 50 characters)

## Examples

```
fix: handle missing mocks file with clear error message
```

```
feat(store): load users from mocks/users.mock.json instead of hardcoded seed
```

```
feat!: require mocks/users.mock.json for all operations

BREAKING CHANGE: The application now requires mocks/users.mock.json to exist. 
Set ROOT_PROJECT and run scripts/start-filesystem-mcp.js to initialize.
```

```
docs: update README with MCP server setup instructions
```

```
chore: install express dependency and update package-lock.json
```

## Footers

Footers are key-value pairs that appear at the end of the commit message, separated by blank lines:

```
feat: add user deletion endpoint

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01EfRva64ACrdnAXXD6pVdZi
```

Multiple trailers are allowed and common (e.g., `Closes:`, `Co-Authored-By:`, `Claude-Session:`, `BREAKING CHANGE:`).

## Summary

Every commit message in this repository should:
1. Start with `<type>` (required) and optional `[scope]`
2. Include a short, imperative `:` description
3. Add a body if explaining *why* (not *what* — the diff shows that)
4. Use `!` or `BREAKING CHANGE:` footer to signal breaking changes
5. Include project-scoped trailers (co-author, session, etc.) as footers at the end
