# NOTES

## Server (MCP)
I connected the official filesystem server at project scope (`.mcp.json`) and pointed it at `./docs` only. The API reference lives there, so Claude can read it without being able to reach the rest of the repo, including `.git`. It needs no credentials. The permission rule in `.claude/settings.json` allows just `mcp__filesystem__read_text_file`, so reading docs is prompt-free while writing, moving or editing files still asks first.

## Skill
`add-api-endpoint` captures the path every endpoint change takes in this repo: a helper in `db/store.js`, the route with `400`/`404` validation and the `{ "error": "..." }` shape, mounting in `server.js`, supertest tests with `store.reset()`, and an entry in `docs/api.md`. The description lists the phrasing that should trigger it ("add a DELETE /users/:id", "add a /posts resource") and says what it is not for (questions about the code, lint or dependency work, changes that touch no routes), so it stays quiet on unrelated requests.

## Command
`/check-conventions [file, route or branch]` reviews changes against the project's conventions checklist and reports pass, fail or not applicable with `file:line` for each failure. It is worth a shortcut because the review is identical every time and mirrors `CLAUDE.md`. It is read-only: `allowed-tools` limits it to `git diff`, `git status`, `git log`, `Read`, `Grep` and `Glob`.

## Hook
A `PreToolUse` hook on `Bash` that prevents rather than reacts: it denies any `git push` that targets `main` (explicit `main`, `+main`, `HEAD:main`, `--all`/`--mirror`, or a bare push while on `main`), so work always goes through a branch and a pull request. It runs `.claude/hooks/block-git-push-main.sh`, which is committed so every clone gets the same guard. It needs `jq` and `perl`. It does not catch pushes hidden inside `bash -c` or an alias.

## Headless run
I ran `claude -p` to check that `docs/api.md` matches the endpoints in `routes/*.js`. It reported all five endpoints present on both sides. I locked it down with `--allowedTools "Read" "Grep" "Glob"` and `--max-turns 8`: the task only reads files, so it gets no shell, no edit tools and no MCP, and with nobody watching it cannot change anything or run commands.
