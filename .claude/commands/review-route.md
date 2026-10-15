---
description: Review a new/changed resource against the add-route SKILL.md checklist (store fn, route file, mount, tests, docs, lint/test pass)
---

Review the current diff (`git diff` / `git status` against the target branch, plus any files the user names) for a new or changed resource in this Express API. Check it against the checklist in `.claude/skills/add-route/SKILL.md`:

1. **Store functions** — new state lives in `db/store.js`; the route file doesn't hold state directly.
2. **Route file** — one file per resource in `routes/<resource>.js`, exports `express.Router()`, uses `router`/`store` naming, handlers follow the verb+noun store-call skeleton.
3. **Mounted in `server.js`** — `app.use('/<basePath>', <resource>Router)`.
4. **Error responses** — every error path returns `res.status(<code>).json({ error: '<message>' })`; `400` for bad/missing input, `404` for missing records; no envelope on success responses.
5. **Tests** — `tests/<resource>.test.js` exists, mirrors the route filename, uses `test.beforeEach(() => store.reset())`, and asserts status + body shape for each endpoint (including the 400/404 paths).
6. **Docs** — `docs/api.md` updated with the new endpoints.
7. **Lint/test pass** — `npm test` and `npm run lint` both succeed.

Report findings as a checklist: which items pass, which are missing or inconsistent with the skeletons in `.claude/skills/add-route/SKILL.md`, with file:line references. Don't invent issues outside this checklist's scope (e.g. don't flag unrelated style preferences).
