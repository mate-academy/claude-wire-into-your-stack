---
name: review-checklist
description: Review changes against the Course API project checklist
---

# Review Checklist

Run this to review recent changes against the project's conventions.

## Usage

```
/review-checklist
```

## What It Checks

### Route Conventions
- [ ] One route file per resource in `routes/`
- [ ] Exports a single Express `Router`
- [ ] Mounted in `server.js` under its base path
- [ ] Input validation in route (not in store)
- [ ] Returns 400 for bad input (missing required fields)
- [ ] Returns 404 for missing records
- [ ] Returns 201 for creation with created resource
- [ ] Returns 200 for successful updates

### Store Conventions
- [ ] All data access through `db/store.js`
- [ ] Routes never hold state directly
- [ ] Store exports: `listXxx`, `getXxx`, `createXxx`, `updateXxx`, `reset`
- [ ] `reset()` reseeds to initial data for test isolation

### Error Response Format
- [ ] All errors are `{ "error": "message" }`
- [ ] No plain string errors
- [ ] No `{ "message": "..." }` or `{ "errors": [...] }` shapes

### Test Conventions
- [ ] Test file at `tests/<resource>.test.js`
- [ ] Uses `test.beforeEach(() => store.reset())`
- [ ] Uses `supertest` with `request(app)`
- [ ] Tests both success and error paths (404, 400, 200, 201)
- [ ] Asserts status before response body

### Code Style
- [ ] CommonJS (`require`/`module.exports`)
- [ ] ES2022
- [ ] ESLint passes (`npm run lint`)
- [ ] Tests pass (`npm test`)

## Output

Reports any violations with file:line references.