# NOTES

**Server.** Connected the official `fetch` MCP server (`uvx mcp-server-fetch`), a credential-free reference server, via `.mcp.json` at the repo root. It's useful here because this is a small REST API — Claude can pull in live reference pages (MDN, RFCs, Express docs) to check the project's status-code and error conventions against the real spec instead of guessing. The permission rule allows only `mcp__fetch__fetch`, the single read-only tool the server exposes, rather than blanket-allowing the server.

Confirmed invocation (`claude -p` picking up the committed `.mcp.json`, tool restricted to `mcp__fetch__fetch`):

```
TOOL_USE: mcp__fetch__fetch {"url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/201"}
TOOL_RESULT: [text/html content of the MDN 201 page]
TEXT: The HTTP 201 Created status code indicates that a request has succeeded and,
as a result, a new resource has been created (commonly the result of a POST request).
```
This matched an earlier check where the same server was used to confirm `POST /users` (`201` with the created user) and the `400` validation responses in `routes/users.js` line up with the MDN/RFC 9110 definitions.

**Skill.** `.claude/skills/add-api-resource/` captures the repeated shape of adding a new resource to this API: store functions in `db/store.js`, a route file with validation in the route (`400`/`404`), the `{ "error": "message" }` error shape, mounting in `server.js`, matching `node:test`/`supertest` tests, and a `docs/api.md` entry. The description names concrete trigger phrases ("add a DELETE /users/:id route", "add a new products resource") and explicitly excludes editing existing route logic or unrelated Express questions, so it fires on "add a new endpoint" but not on "why does this route return 400."

**Command.** `/check-route [resource]` reviews a route (or all of them) against the same conventions checklist, without changing anything — a read-only complement to the skill for auditing code that may not have gone through it. Worth a shortcut because it's something I'd otherwise re-derive from CLAUDE.md by hand before every PR; run against `users` it correctly found two real gaps (unvalidated non-numeric `:id`, missing `400`-case tests).

**Hook.** A `PreToolUse` hook on `Bash` (prevents, not just reacts) blocks any `git push` containing `--force`/`-f` (leaving `--force-with-lease` alone), since a force push can silently overwrite a teammate's commits on the shared remote. Verified live: a fresh Claude session's force-push attempt was intercepted before git ran, with the tool result showing the hook's block message.

**Headless run.** Ran `claude -p` to add the three test cases `/check-route` had flagged as missing, with `--allowedTools "Read,Glob,Grep,Edit,Bash(npm test:*)"`. Locked out `Write` (so it could only edit the existing test file, not create new ones) and all `Bash` beyond `npm test` (so it could verify but not touch git, install packages, or run anything else). It respected that boundary — when it needed `npm install` to actually run the suite, it stopped and asked for approval instead of running it.
