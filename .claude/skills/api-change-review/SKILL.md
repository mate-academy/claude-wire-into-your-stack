---
name: api-change-review
description: Review changed Express API endpoints in this project. Use when asked to review an API change, check endpoint edge cases, or prepare API test findings.
---

# API change review

Read the requested diff and the relevant router, db/store.js helper, and Supertest cases. Keep the review within the requested endpoint.

Check status codes and JSON responses for success, malformed input, missing records, and any authorization requirement stated by the project. For update routes, check that the record ID stays unchanged and invalid requests do not mutate stored data.

Run npm test and npm run lint when reviewing actual code. Add a focused reproduction only for a uncovered behavior that matters to the requested change. Do not rewrite course grading tests to make a failure pass.

Report actionable findings first: severity, file/line, triggering request, observed result, and expected behavior grounded in requirements. End with checks actually run and any unverified cases. Clearly label hypothetical results. Do not commit, push, or publish a PR merely because this skill was invoked.
