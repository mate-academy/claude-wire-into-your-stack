---
description: Summarize the endpoints in an Express route file (paths, inputs, responses, store calls)
argument-hint: <path to route file, e.g. routes/users.js>
allowed-tools: Read, Grep, Glob
---

Summarize the Express route file at: $ARGUMENTS

If `$ARGUMENTS` is empty or blank, do not guess a file. Ask the user to provide a route file path (for example `routes/users.js`) and stop.

## Steps

1. Read the route file given in `$ARGUMENTS`. If it does not exist, say so and stop.
2. Read `server.js` and find where this router is mounted (`app.use('<base>', <router>)`) to get its base path. If the router is not mounted, say so instead of guessing a base path.
3. Read `db/store.js` to confirm which helper functions exist and what they return.
4. For every endpoint in the route file, work out:
   - HTTP method and full URL path (base path from `server.js` + the route's relative path)
   - Expected input: path params, and the body fields it reads and validates
   - Success response: status code and body shape
   - Error responses: status codes and the exact `{ "error": "..." }` messages
   - The `db/store.js` functions it calls

## Output

Present one concise Markdown table, one row per endpoint:

| Method | Full path | Inputs | Success response | Error responses | Store calls |
| --- | --- | --- | --- | --- | --- |

Follow the table with a one-line note on how the base path was determined (cite `server.js:LINE`).

## Rules

- Report only what you verified in the source files. Cite `file:line` for anything non-obvious.
- If something cannot be determined from the files, write "not determined" in that cell. Do not infer or invent.
- Read-only: do not modify any file, run tests or the linter, or make any Git changes.
