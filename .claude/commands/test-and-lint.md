# /test-and-lint

Run the full test suite and linting check to validate all changes.

```bash
npm test && npm run lint
```

This command:
- Runs the Node test runner on all test files
- Checks the codebase with ESLint for style violations
- Confirms both pass before considering changes complete

Use this before committing to ensure the code meets the project's standards.
