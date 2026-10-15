---
description: Scaffold a new route in the Course API end to end — store helper, handler, mount, and tests — following the repo's conventions, then verify with lint + tests.
argument-hint: <METHOD /path> [— what it should do]
---

Implement a new HTTP route for this Express Course API: **$ARGUMENTS**

Apply the repo's route conventions exactly — the `writing-routes` skill documents them. Work in this order:

1. If the endpoint needs a data operation the store doesn't have yet, add it to `db/store.js` and export it.
2. Add the handler to the resource's file in `routes/`. For a brand-new resource, create `routes/<resource>.js` and mount it in `server.js` under its base path.
3. Coerce any `:id` param with `Number(...)`, validate input (`400` on bad input, `404` on a missing record), and return errors in the `{ "error": "message" }` shape.
4. Add tests in `tests/` covering the success path and each error path.
5. Run `npm run lint` and `npm test`. Report the results; if either fails, fix it and rerun until both pass.

If the spec in **$ARGUMENTS** is ambiguous — missing the method, the path, or the request/response shape — ask before writing code rather than guessing.
