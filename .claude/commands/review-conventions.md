# Review against project conventions

Review **$ARGUMENTS** against this project's conventions (from `CLAUDE.md`):

- One route file per resource, mounted in `server.js` under its base path
- All data access goes through `db/store.js` — routes never hold state directly
- Input is validated in the route: `400` on bad input, `404` when a record is missing
- Error responses are JSON shaped `{ "error": "message" }`

If `$ARGUMENTS` is empty, review the current uncommitted changes (`git diff HEAD`) instead of a specific file.

For each convention, report pass or fail with the specific line and a one-sentence reason when it fails. Don't fix anything — just report findings.
