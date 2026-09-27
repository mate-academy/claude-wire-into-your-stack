# Test Structure Convention

**Trigger:** When writing or reviewing test cases, adding tests, debugging test failures, or explaining test patterns.

## How Tests Are Structured

Tests use Node's built-in `test` module with `supertest` for HTTP requests and `node:assert` for assertions.

### Test Pattern
```javascript
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('descriptive test name', async () => {
  const res = await request(app).get('/endpoint');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
});
```

### Key Conventions
- **Import pattern:** `require('node:test')`, `require('node:assert')`, `require('supertest')`, require the app and store
- **Setup:** Use `test.beforeEach(() => store.reset())` to reset state before each test
- **HTTP requests:** Use `request(app).get/post/put/delete('/path')` to make requests
- **Assertions:** Check `res.status` for status code and `res.body` for response data
- **Async:** Always use `async` since HTTP requests are asynchronous
- **Naming:** Test names are descriptive: "GET /users returns the seeded list", "POST /users creates a user"

### Common Assertions
- `assert.equal(res.status, 200)` — check status code
- `assert.ok(Array.isArray(res.body))` — verify array response
- `assert.equal(res.body.name, 'expected')` — check response properties
- `assert.ok(res.body.id)` — verify property exists

## Apply This When
- Writing new test cases or test files
- Reviewing existing tests
- Debugging test failures or understanding why a test structure is the way it is
