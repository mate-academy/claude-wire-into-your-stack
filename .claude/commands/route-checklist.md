Review the route file `routes/$ARGUMENTS` against the project conventions and report any violations.

Check each of the following:
1. All data access goes through `db/store` — no state held directly in the route file
2. Missing required fields return `400` with `{ "error": "..." }`
3. Missing records return `404` with `{ "error": "... not found" }`
4. POST handlers return status `201`, all others return `200`
5. The router is exported with `module.exports = router`
6. The file requires only `express` and `../db/store` — no other dependencies

For each item: state PASS or FAIL with the relevant line number if it fails. End with a one-line summary.
