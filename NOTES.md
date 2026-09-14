# NOTES — wiring Claude into Course API

Everything below is committed, so a fresh clone gets the same setup.
Run `npm ci` once first (the lint hook needs ESLint from `node_modules`).

| Piece   | File |
|---------|------|
| MCP     | `.mcp.json` + permission rules in `.claude/settings.json` |
| Skill   | `.claude/skills/add-endpoint/SKILL.md` |
| Command | `.claude/commands/convention-review.md` |
| Hook    | `.claude/settings.json` → `.claude/hooks/lint-on-edit.js` |

## 1. Server — `docs` (filesystem MCP)

I connected `@modelcontextprotocol/server-filesystem` at project scope as
`docs`, pointed at `docs/`. The API reference in `docs/api.md` has to stay in
sync with `routes/`, so letting Claude read the docs directly is useful on
almost every change here. It needs no credentials, and it runs on `npx`,
which the repo already requires. The permission rule **allows only the three
read tools I actually use**: `read_text_file`, `list_directory` and
`search_files`. It **denies the write tools** (`write_file`, `edit_file`,
`move_file`, `create_directory`), so doc edits go through normal `Edit`, where
the hook and the diff can see them. Other tools still prompt.

Used once for real: a headless run read `docs/api.md` through
`mcp__docs__read_text_file` and compared it with `routes/*.js`. There were no
permission denials. It found no hard mismatches, but flagged that non-numeric
ids return `404` rather than `400`.

Notes:
- Servers from `.mcp.json` show as *pending* until each person approves them
  the first time they start `claude`. That is deliberate, and I did not commit
  an auto-approval.
- Claude Code sends MCP *roots* (the project folder), and the filesystem server
  uses those instead of the `docs` argument. In practice it can *read* the
  whole repo. The read-only permission rule is what actually limits it.

## 2. Skill — `add-endpoint`

It captures the one workflow this repo repeats. Every endpoint change touches
the same layers in the same order:
1. a helper in `db/store.js`;
2. the handler in `routes/<resource>.js`, with `400`/`404` and `{ error }` bodies;
3. mounting in `server.js`;
4. supertest tests with `store.reset()`;
5. the `docs/api.md` entry;
6. `npm test` + `npm run lint`.

The description names the **action** (adding, changing, removing), the
**object** (HTTP endpoint or resource in this Express API) and gives **example
phrasings** ("add DELETE /users/:id", "return 400 for a bad id"). It also says
what it is **not** for: lint/CI config, dependencies, explaining code.

Verified without naming the skill:
- "I need a DELETE /users/:id endpoint… give me the plan" → Claude called
  `Skill add-endpoint` first and followed its order.
- "Briefly explain what db/store.js does" → the skill was available but **not**
  invoked.

## 3. Command — `/convention-review [files]`

A read-only review against the checklist in `CLAUDE.md`: one router per
resource, no state in routes, 400 on bad input, 404 on missing records,
`{ error }` shape, tests, docs. The output is a verdict plus a
`file:line` table with a fix for each problem. With no arguments it reviews the
branch diff against `main`. `$ARGUMENTS` narrows it to given files. I'd run it
before every commit or PR, and it's the same long prompt each time, so a
shortcut makes sense. `allowed-tools` limits it to Read/Grep/Glob plus
`git diff`/`git status`.

Run on `routes/users.js`, it reported `NEEDS WORK`: non-numeric ids give `404`
instead of `400`, and there are no tests for the `400` branches. The first run
read files with `Bash cat`, so I added "use Read/Grep/Glob" to the prompt. The
re-run used only those tools.

## 4. Hook — ESLint after every edit (reacts, `PostToolUse`)

- **Event:** `PostToolUse`. The standard is "every JS file Claude touches
  passes ESLint", and that can only be checked after the file exists.
- **Matcher:** `Edit|Write`, the tools that change files.
- **Command:** `node "$CLAUDE_PROJECT_DIR/.claude/hooks/lint-on-edit.js"`.
  Node keeps it cross-platform.

The script skips non-`.js` files and `node_modules`, and runs ESLint with
`--fix`. If errors remain, it exits `2` so the errors are fed back to Claude.
Warnings go back as `additionalContext` and don't block. If ESLint isn't
installed, the hook skips linting and prints a hint instead.

Triggered on purpose: I asked headless Claude to write
`module.exports = notDefined;`. The hook exited `2` with `no-undef`, Claude
rewrote the file, and the second hook run exited `0`. The probe file was
deleted afterwards.

## 5. Headless — project health check

```bash
claude -p "Check the health of this project: run the test suite and the linter, then give a 3-line report: tests (passed/failed counts), lint (errors/warnings), and overall verdict GREEN or RED. If something fails, name the file and line. Do not modify any files." \
  --permission-mode dontAsk \
  --allowedTools "Bash(npm test)" "Bash(npm run lint)" "PowerShell(npm test)" "PowerShell(npm run lint)" "Read" \
  --max-turns 6
```

Result: 5/5 tests, 0 lint problems, GREEN, and no permission denials.

What I locked down, and why:
- **Exact commands only**, `npm test` and `npm run lint`, with no wildcards.
  Plus `Read`, so it can open a failing file. No Edit/Write, no network, no MCP.
- **`--permission-mode dontAsk`**. My user settings use `auto` mode, and in a
  first attempt Claude ran commands I never listed. `--allowedTools` only
  *adds* approvals. `dontAsk` makes everything else a hard deny. Checked: with
  this setup `node -e "…writeFileSync…"` and `git branch denial-probe` were
  both denied, and neither had any effect.
- **Bash and PowerShell rules together**, because on Windows Claude runs shell
  commands through its PowerShell tool. The same line works on macOS/Linux.
- **`--max-turns 6`**, a cap so an unattended run can't loop.
- One caveat: read-only commands such as `git log` are auto-allowed in every
  mode. They can't change anything, but they are not blocked.
