# Wiring notes

## 1. Server connected (`.mcp.json`)

**Server:** `@modelcontextprotocol/server-fetch` (named `web-fetch`)

**Why useful here:** This API is built with Express and Node.js. Being able to fetch live documentation — npm package readmes, the Express routing guide, Node's built-in `node:test` API — means Claude can check the exact signature of a dependency without hallucinating an outdated one. It's credential-free and works on any clone.

**Permission rule:** `.claude/settings.json` allows only `mcp__web-fetch__fetch`. This scopes the server to a single read-only tool and prevents any other operation the server might expose.

## 2. Skill (`.claude/skills/add-route/SKILL.md`)

**What it captures:** The project repeats one pattern constantly — adding a new resource (router file, store helpers, mount in `server.js`). The description reads: *"Fires when adding a new route, resource, or endpoint to this Express API."* That wording is specific enough to trigger on "add a notes route" but not on "explain what a router is" or "fix a bug in users.js".

The skill encodes: one file per resource in `routes/`, all data through `db/store.js`, `400`/`404` with `{ "error": "..." }`, one-line handler comments, and how to mount in `server.js`.

## 3. Command (`.claude/commands/review-route.md`)

**Command:** `/review-route routes/users.js`

**Why a shortcut is worth it:** Every new route needs the same checklist reviewed before merging: data access through the store, correct validation, right status codes, the `{ "error": "..." }` shape, handler comments, and `module.exports = router`. Without a command, that review is ad-hoc and inconsistent. With it, one invocation runs the same checklist every time and flags exactly what's wrong and why.

`$ARGUMENTS` passes the file path, so the command works on any route file.

## 4. Hook (`.claude/settings.json`)

**Event:** `PostToolUse` on `Edit`

**Reaction vs prevention:** This hook *reacts* — it doesn't block. After Claude edits any file, `npm run lint` runs automatically. ESLint is the project's style enforcer (configured in `eslint.config.js`), so linting after every edit means a lint failure surfaces immediately rather than at CI time.

**Why PostToolUse / Edit:** Edit is the tool Claude uses to modify existing files. Linting on Write as well would trigger on every file creation, including non-JS files. PostToolUse is the right event because it fires after the change is already on disk — appropriate for a check that reads the file.

## 5. Headless task run

**Task:** List every HTTP method and path the API currently handles.

**Command run:**
```
claude -p "Read routes/users.js and routes/health.js. List every HTTP method and path the API currently handles, one per line in the format METHOD /path — description." --allowedTools Read
```

**Why these allowedTools:** The task only needs to read two files. Locking it to `Read` means there's no way for the headless run to write, delete, or execute anything — safe to run in CI or a pre-deploy check without supervision.

**Output produced:**
```
GET /health — liveness check with uptime
GET /users — list all users
GET /users/:id — fetch one user (404 if missing)
POST /users — create a user (requires name and email)
PUT /users/:id — update an existing user (404 if missing)
```
