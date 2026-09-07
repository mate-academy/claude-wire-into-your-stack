---
description: Check that routes/*.js, docs/api.md, and tests/*.test.js are in sync
argument-hint: "[resource name, e.g. users — omit to check all resources]"
---

Check whether the routes, API docs, and tests in this repo agree with each other. Scope: $ARGUMENTS (if empty, check every resource under `routes/`).

For each route file in scope:

1. Read the route file and list its actual endpoints: method, path, required/optional input, success status + body, and every error status it can return (`400` for bad input, `404` for a missing record), per this project's conventions (see CLAUDE.md).
2. Read `docs/api.md` and check that every one of those endpoints has a matching, accurate section — same method/path, same required fields, same status codes.
3. Read the matching `tests/<resource>.test.js` and check that every success path and every distinct error path from step 1 has a corresponding test case.
4. Note any mismatch in either direction — an endpoint documented or tested that no longer exists in the route is just as much a bug as one that's missing.

Report findings as a list, grouped by resource, each item stating: what the route actually does, and whether `docs/api.md` and the tests match, don't match, or are missing entirely. Do not edit any files — this command only reports; if the user wants the mismatches fixed, they'll ask separately (the `doc-sync` skill handles that).
