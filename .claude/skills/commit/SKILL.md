---
name: commit
description: Create a git commit using the Conventional Commits style. Use when the user asks to commit changes, create a commit, or draft a commit message.
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
---

# Create a Conventional Commit

## Steps

1. Inspect the current state:
   - `git status` and `git diff HEAD` to see staged and unstaged changes
   - `git log --oneline -5` to match the repo's recent style
2. Stage the relevant files by name. Never use `git add -A` or `git add .`, and never stage secrets (`.env`, credentials) or unrelated files such as `.idea/` or `.mcp.json`.
3. If the changes cover several unrelated concerns, split them into separate commits.
4. Write the message in the format below and commit with `git commit -m` (use a HEREDOC for multi-line messages).
5. Run `git status` afterward to confirm success. Do not push unless asked.

## Message format

```
<type>(<optional scope>): <description>

<optional body>

<optional footer(s)>
```

### Types

| Type | Use for |
|------|---------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `style` | Formatting; no code meaning change |
| `refactor` | Neither a fix nor a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `build` | Build system or dependencies |
| `ci` | CI configuration (e.g. GitHub Actions) |
| `chore` | Other changes that don't touch src or tests |
| `revert` | Reverting a previous commit |

### Rules

- Subject: imperative mood ("add", not "added"), lowercase, no trailing period, max 72 characters.
- Scope: the affected area, e.g. `users`, `health`, `store`, `server` (matches `routes/`, `db/store.js`, `server.js`).
- Body: explain *what* and *why*, not *how*; wrap at 72 characters; separate from subject with a blank line.
- Breaking changes: add `!` after type/scope (`feat(users)!: ...`) and a `BREAKING CHANGE: <details>` footer.
- Issue references go in the footer (`Closes #123`).
- End the message with the attribution line the session specifies (e.g. a `Co-Authored-By:` trailer), if one is given.

### Examples

```
feat(users): add PATCH endpoint for updating a user

fix(store): return 404 when record is missing

docs: update README with setup instructions

ci: add lint step to workflow
```
