---
description: Review a route file against this project's route conventions
argument-hint: [route file, e.g. routes/users.js]
---

Review the route file $ARGUMENTS (use routes/users.js if no file is given) against this project's conventions.

Check:
1. Each handler has a `// METHOD /path — description` comment.
2. All data access goes through db/store.js.
3. Error responses use `{ error: '...' }` with the right status (400 for bad input, 404 for missing records).
4. POST returns 201 with the created object.
5. Every endpoint has a success test and an error test in tests/.
6. Every endpoint is described in docs/api.md.

Do not edit any files. Return a checklist with ✅ or ❌ for each point, the file and line for every ❌, and a one-line fix for each.
