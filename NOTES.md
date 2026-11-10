# NOTES

How Claude is wired into this repository, and why. All of this wiring lives in the repository, so it reaches every teammate who clones it.

## 1. MCP Server

**Server:** `mcp-server-fetch`, connected at project scope in `.mcp.json` (launched with `uvx`).

**Why this one:** It needs no credentials and gives Claude something this project genuinely lacks: access to live, authoritative documentation. Because the API is Express, we used it to consult the official Express documentation instead of relying on memory, so route and error-handling advice reflects the current docs.

**Permission rule:** `.claude/settings.json` contains `permissions.allow: ["mcp__fetch__fetch"]`. That is the single read-only tool we actually use. Pre-approving it removes a prompt on every lookup, while allowing only that tool (not the whole server) keeps the grant narrow.

## 2. Project Skill

**Skill:** `api-review` (`.claude/skills/api-review/SKILL.md`).

**Why:** Reviewing a route against the project's conventions is a repeated task: route structure, input validation, `400`/`404` status codes, the `{ "error": "message" }` shape, and access through `db/store.js`. Writing it down once means every review applies the same checklist.

**Triggering:** The description says what it is for (review, audit, check or critique a file in `routes/` or an endpoint such as `POST /users`) and what it is not for (writing routes, fixing bugs, running tests, linting, non-route code). That precision keeps it from firing on unrelated requests.

**Confirmation:** We asked Claude to review a route in plain language, without naming the skill, and it activated `api-review` automatically.

## 3. Custom Command

**Command:** `/route-summary` (`.claude/commands/route-summary.md`).

**Why:** Summarizing the endpoints of a route file is something we do often, and the output is easy to get inconsistent. The command always produces the same table: method, full path, inputs, responses, errors and store calls.

**Input:** The route file path is passed through `$ARGUMENTS`, for example `/route-summary routes/users.js`. If it is empty, the command asks for a path rather than guessing. It also reads `server.js` to resolve the base path, and it is limited to the read-only tools `Read`, `Grep` and `Glob`.

**Testing:** We ran it on `routes/users.js` to confirm it produces the intended table.

## 4. Hook

**Hook:** A `PreToolUse` hook on the `Bash` tool, configured in `.claude/settings.json` and implemented in `.claude/hooks/block-destructive-git.js`. It prevents rather than reacts.

**Why:** Some Git commands destroy work with no way back. The standard that must always hold is that Claude never discards uncommitted changes or untracked files by accident.

**How it works:** Claude Code passes the pending command to the script as JSON on stdin. The script inspects each part of a compound command (`&&`, `||`, `;`, `|`) and blocks `git reset --hard` and any `git clean` that is not a dry run (`-n` / `--dry-run`). It exits with code `2` and explains the safer alternative; everything else, such as `status`, `diff`, `commit` and `log`, exits `0` and passes through. It never runs Git itself.

**Verification:** All 34 simulated tests passed.

## 5. Headless Run

**Command:**

```
claude -p "Read routes/users.js and server.js. List the HTTP methods and full endpoint paths. Do not modify any files." --allowedTools "Read" "Grep" "Glob" --permission-mode dontAsk
```

**Result:** Claude returned the four user endpoints and modified no files.

**Why only `Read`, `Grep` and `Glob`:** The task is pure inspection, so these are the only capabilities it needs. Because `Edit`, `Write` and `Bash` are not pre-approved, they are denied, so the run cannot change files or execute commands and is safe to leave unattended.

**Why `dontAsk`:** There is nobody to answer a permission prompt in a headless run. `dontAsk` denies anything not pre-approved instead of waiting or asking, so the run stays within its allowlist and cannot hang.
