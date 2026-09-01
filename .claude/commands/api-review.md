---
description: Review changed (or a given path's) API code against this project's endpoint checklist
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(npm run lint), Read, Grep, Glob
argument-hint: [path]
---

Review the API code for compliance with this project's conventions
(see CLAUDE.md and `.claude/skills/express-endpoint/SKILL.md`).

Target: `$ARGUMENTS`. If a path was given, review that file (and its
matching route/test/docs files). If no path was given, run `git diff` and
`git status` to find the current uncommitted changes and review those
instead.

Check each of the following, and report a pass/fail line with a
`file:line` reference for anything that fails:

- [ ] Error responses are shaped exactly `{ "error": "message" }`
- [ ] Bad input returns `400`; a missing record returns `404`; a
      successful create returns `201`
- [ ] All data access goes through `db/store.js` — no route holds state
      directly, and any new store helpers are wired into `seed()`/`reset()`
- [ ] The router is required and mounted in `server.js` after
      `app.use(express.json())`
- [ ] A matching `tests/<resource>.test.js` exists, using `node:test` +
      `supertest` against the imported `app` (no `describe`/`it`, no live
      server)
- [ ] `docs/api.md` has a `### METHOD /path` section for every
      endpoint touched
- [ ] `npm run lint` is clean

End with a short summary: overall pass/fail, and the minimal list of fixes
needed if it doesn't pass.
