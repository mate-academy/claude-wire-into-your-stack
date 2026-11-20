# Notes: wiring Claude into the Course API

This branch only adds Claude configuration and these notes. It doesn't change the app: `server.js`, `routes/`, `db/`, `tests/` and `docs/` are the same as on `main`.

## Server (MCP)
I connected **Context7** (`https://mcp.context7.com/mcp`) at project scope in `.mcp.json`. It's an HTTP server that needs no key and serves up-to-date docs for the libraries this project is built on: Express 4, supertest, ESLint and Node's test runner. Claude can then check how Express actually behaves instead of relying on memory, which matters on a project whose conventions (status codes, the `{ "error": "message" }` shape) depend on Express's request and error handling.

The server has exactly two tools, and both declare themselves read-only. `.claude/settings.json` allows those two by name rather than the whole server, so any tool Context7 adds later still asks first:
- `mcp__context7__resolve-library-id`
- `mcp__context7__query-docs`

**Real task.** CLAUDE.md says every error response is JSON `{ "error": "message" }`. I asked Claude, using Context7's Express 4 docs (`/websites/expressjs/4.x`) and `server.js`, what the API returns when `POST /users` gets a malformed JSON body. It found a gap in the convention:
- `express.json()` is based on body-parser. When parsing fails it passes a `400` error to `next()`, so the route handler and its JSON `400` never run.
- `server.js` has no error-handling middleware (the four-argument `(err, req, res, next)` kind), so the error reaches Express's built-in handler. The docs say that handler writes "the HTML of the status code message" in production, or `err.stack` otherwise.

I confirmed it against the running app: `POST /users` with body `{bad json` returns `400` with `Content-Type: text/html`, and outside production the page includes the stack trace with absolute server paths. The fix is a JSON error handler in `server.js` mounted after the routers. That's an app change, so it's out of scope for this branch; it's a follow-up.

## Skill
`.claude/skills/add-endpoint/` captures how an endpoint is added or changed here. Every endpoint change follows the same six steps: it touches five places (route file, `db/store.js` helper, mount in `server.js`, tests, `docs/api.md`), then gets verified with `npm run lint && npm test`. The skill writes down the project's rules (`Number(req.params.id)`, `400`/`404` with `{ error }`, `201` on create, `204` on delete, `store.reset()` in tests) and adds `reference/test-template.md` for the test layout, based on `tests/users.test.js`.

The description names the trigger (adding, changing or removing an HTTP endpoint or resource), lists the files involved, gives example requests ("add a DELETE /users/:id", "add a /posts resource"), and rules out lint, CI and non-API work, so it doesn't fire on unrelated edits. To confirm it fires, I asked "add a DELETE /users/:id endpoint" without naming the skill. It loaded and produced a full change across the route, store, tests and docs, with lint and all 7 tests passing. I then removed that endpoint from this branch, because the task is configuration only.

## Command
`/tree [directory]` (`.claude/commands/tree.md`) shows the repo, or one directory in it, as a tree including dotfiles like `.mcp.json` and `.claude/`. It's worth a shortcut because I kept checking where config files landed, and the default `tree` hides dotfiles while `tree -a` dumps all of `.git`.

It runs `node .claude/scripts/tree.js $1` rather than the `tree` program, which isn't installed by default on macOS or most Linux images. The script builds the tree from `git ls-files`, so it only needs Node and git, which the project already requires. Because it follows `.gitignore`, it also leaves out `node_modules/`; the first version listed about 120 KB of packages once dependencies were installed. `allowed-tools: Bash(node .claude/scripts/tree.js:*)` pre-approves only that script, with any directory argument.

## Hook
A **PreToolUse** hook on the **Bash** tool **prevents** pushes to `main`. It runs `.claude/hooks/block-push-to-main.js` before each Bash command, and exits with code 2 (blocking the call) when a `git push` would update `main` on the remote.

It checks both the local branch and the resolved destination, the way git works it out:
- explicit refspecs: `main`, `src:main`, `+main`, `refs/heads/main`, `:main` (delete)
- the local branch: a bare `git push` or `git push origin HEAD` from `main`
- unqualified pushes from any branch: `remote.<name>.push` refspecs, `push.default` (`simple`, `current`, `upstream`, `matching`), `branch.<name>.merge`, `pushRemote`/`pushDefault`, and `@{push}`. A feature branch whose upstream is `main` can't get through with a bare `git push`.
- `--all`, `--branches`, `--mirror`, and pushes chained after `&&` or `;`

I tested it against a throwaway repo on 19 cases, 14 that should be blocked and 5 that should be allowed, and all passed. I also asked Claude to run `git push` on `main` in this repo, and it was blocked. I wrote it in Node because the project already needs it, so it doesn't depend on `jq`.

Limits: it reads the command as text, so a push to `main` that only appears inside a quoted string or heredoc is also blocked. It only guards Claude's tool calls; a `git push` typed in a terminal (or with `!`) isn't checked, so GitHub branch protection is still the real safeguard.

## Headless run
I ran a docs-coverage check with nobody watching:

```
claude -p "Check that every route in routes/ has a matching entry in docs/api.md and list any gaps" --allowedTools "Read,Grep,Glob"
```

It found no gaps: all 5 routes (`GET /health`, `GET /users`, `GET /users/:id`, `POST /users`, `PUT /users/:id`) are documented, with matching status codes.

`--allowedTools` is limited to `Read`, `Grep` and `Glob` because the task only needs to find route files, search for handlers and read the docs. There's no `Edit`/`Write`, so it can't change files, and no `Bash`, so it can't run commands, install packages or push. Anything outside that set isn't pre-approved, and with no one there to approve it, a headless run can't use it. That makes the run safe to repeat unattended, e.g. as a CI or pre-PR check.
