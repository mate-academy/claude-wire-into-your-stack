Review the current changes for: $ARGUMENTS

Inspect the current Git diff and project conventions.

Check for:

- incorrect status codes;
- missing input validation;
- direct state management inside routes;
- inconsistent `{ "error": "message" }` responses;
- missing or insufficient tests;
- lint problems;
- accidental or unrelated files.

Run `git diff`, `npm test`, and `npm run lint`.

Report findings by severity. Do not modify files unless explicitly asked.
