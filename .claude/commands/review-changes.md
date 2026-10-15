---
name: review-changes
description: Review recent Git changes against project standards (error handling, style, tests)
usage: /review-changes [task description]
---

# Review Changes Command

Review the latest Git changes to ensure they follow the Course API project standards.

## What This Checks

This command validates changes against the project's quality checklist:

### ✅ Error Handling
- Error responses use the standard format: `{ "error": "message" }`
- Routes return `400` for bad input (missing/invalid params)
- Routes return `404` when a record is not found
- All error cases in handlers are covered

### ✅ Code Style & Conventions
- New route files follow naming: `routes/resource-name.js`
- Each route file exports an Express router
- All data access goes through `db/store.js` (no direct state in routes)
- Code follows ESLint rules (checked via `npm run lint`)

### ✅ Tests
- New endpoints have corresponding tests in `tests/`
- Test file follows naming: `tests/resource-name.test.js`
- Tests use Node's built-in test runner (see `package.json`)
- Happy path and error cases are tested

### ✅ Integration
- New routes are properly mounted in `server.js` with correct base path
- Route files include proper require statements

## How to Use

```bash
# Review changes with a task description
/review-changes Implement user authentication endpoints

# Or just review without context
/review-changes
```

## What Happens

1. Fetch the latest Git changes (staged + unstaged)
2. Identify modified files in `routes/`, `tests/`, and `server.js`
3. Check each changed file against the checklist
4. Report findings:
   - ✅ Passing items
   - ⚠️ Warnings (missing tests, format issues)
   - ❌ Blockers (error handling, code style)
5. Suggest fixes for any failures

## Example Output

```
📋 Review Results: User Auth Changes

✅ Error Handling
  ✓ Standard error format used
  ✓ 400 returned for validation
  ⚠️ 404 missing in one endpoint

✅ Code Style
  ✓ File naming correct
  ✓ Router exported properly
  ✓ ESLint passes

⚠️ Tests
  ✗ No tests found for POST /auth/login
  ✓ 3 test cases added

📝 Recommendations:
  - Add test for POST /auth/login error cases
  - Verify 404 response in GET /auth/:id
```

## Implementation Details

The command will:
- Run `git diff HEAD` to get all changes
- Parse modified files for common patterns
- Cross-reference with existing tests
- Run `npm run lint` on modified JS files
- Provide actionable feedback
