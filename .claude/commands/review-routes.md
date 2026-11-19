---
description: Review Express routes against the project's conventions (read-only, reports findings only)
argument-hint: [route file or route path, e.g. users or GET /users/:id]
allowed-tools: Read, Grep, Glob, Skill
---

Review the Express routes in this project against its conventions. This is a read-only review: report findings only.

## Scope

Argument: `$ARGUMENTS`

- If the argument is empty, review every file in `routes/`.
- If it names a file (e.g. `users` or `routes/users.js`), review that file.
- If it names a route (e.g. `GET /users/:id`), find the handler in `routes/` and review it, along with its store helper and tests.
- If nothing matches, say so and list the files in `routes/`. Do not guess.

## Steps

1. Load the `express-route-conventions` skill with the Skill tool. It is the source of truth for the rules; do not add rules of your own.
2. Read the files in scope, plus what they depend on: `server.js`, `db/store.js`, the matching file in `tests/`, and `docs/api.md`.
3. Check each handler against the skill, in these areas:
   - **Route structure:** one file per resource, router export, relative paths, mounted in `server.js`, handler comments.
   - **Store usage (`db/store.js`):** all data access goes through the store, no state held in the route, helper naming and exports, `Number(req.params.id)`, `reset()` covering any new state.
   - **Validation:** input validated in the route before calling the store, with the project's `400` pattern for POST and PUT.
   - **Errors and status codes:** `{ "error": "message" }` shape, `400` for bad input, `404` for a missing record, `201` for create, `200` otherwise, early `return` on every path.
   - **Tests:** every handler has a test in `tests/<resource>.test.js` covering success and each error status it can return, using the project's test setup.
   - **Docs:** each route is documented in `docs/api.md` and the documented body requirements and status codes match the code. Only check this when the routes in scope are covered by that file.
   - **Style:** the style rules in the skill.
4. Cite only rules that appear in the skill, `CLAUDE.md`, or the existing code. If something looks questionable but no project convention covers it, put it under "Notes", not as a violation.

## Constraints

- Do not edit, create, or delete any file. Do not run commands that change anything.
- Do not propose changes as applied; describe each fix in words only.

## Output

For each file reviewed, list findings grouped by the areas above. Give each finding:
- severity: `violation` (breaks a convention) or `note` (worth a look, no rule broken)
- location as `file:line`
- the convention it relates to
- a one-line suggested fix

End with a short summary: files reviewed, number of violations and notes. If nothing is wrong, say so plainly.
