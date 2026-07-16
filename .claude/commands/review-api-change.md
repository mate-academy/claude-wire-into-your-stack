---
description: Review current API changes against this repository's route and testing conventions.
argument-hint: [optional focus area]
---

Review the current uncommitted changes in this repository.

Focus area: $ARGUMENTS

Use this checklist:

1. Route files follow one-resource-per-file and are mounted from server.js when needed.
2. Data access goes through db/store.js instead of local route state.
3. Input validation returns 400 for bad input.
4. Missing records return 404.
5. Error responses are JSON shaped as { "error": "message" }.
6. Tests in tests/ cover happy path and failure path.

Output format:

- Findings ordered by severity (High, Medium, Low).
- For each finding, include file path, why it matters, and a concrete fix.
- If no findings, say "No findings" and list any residual testing gaps.
