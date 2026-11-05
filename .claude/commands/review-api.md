---
description: Review API changes against this project's conventions and tests
---

Review the current API changes against the following checklist:

1. Express routes follow the existing router structure.
2. All data access goes through db/store.js.
3. Request input is validated.
4. Missing resources return HTTP 404.
5. Invalid input returns HTTP 400.
6. Error responses use JSON format: { "error": "message" }.
7. Successful creation returns HTTP 201.
8. API documentation in docs/api.md is updated when needed.
9. Relevant tests are added or updated.

Inspect the changes and report findings with file names and line numbers.
Do not modify files. Do not commit or push anything.

$ARGUMENTS
