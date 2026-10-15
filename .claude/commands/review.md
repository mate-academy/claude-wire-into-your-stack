---
description: Review code changes in this Express API against project conventions
---

Review the current code changes in this repository.

${ARGUMENTS}

Check the following:

1. Architecture:
   - Routes are organized by resource under routes/.
   - Data access goes through db/store.js.
   - New routers are mounted correctly in server.js.

2. Validation and error handling:
   - Invalid input returns HTTP 400.
   - Missing resources return HTTP 404.
   - Errors use the JSON format { "error": "message" }.
   - Successful resource creation returns HTTP 201.

3. Tests:
   - Relevant tests cover successful requests and error cases.
   - Existing behavior is not unintentionally broken.

4. Code quality:
   - Look for bugs, regressions, and unhandled edge cases.
   - Follow existing project conventions.

Report findings by severity, with file names and line numbers when possible.
Explain why each finding matters.

Do not modify files. If you find no issues, state that clearly.
